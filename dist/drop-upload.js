/*!
 * DropUpload
 * https://github.com/antalaron/drop-upload
 *
 * (c) Antal Áron <antalaron@antalaron.hu>
 *
 * Released under the MIT license
 */
;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        window.DropUpload = factory();
    }
}(function () {
    "use strict";

    var extend = function () {
        var i = 0;
        var result = {};

        for (; i < arguments.length; i++) {
            var attributes = arguments[ i ];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;
            if (!document.documentElement.contains(el)) {
                return null;
            }

            do {
                if (el.matches(s)) {
                    return el;
                }

                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === Node.ELEMENT_NODE);

            return null;
        }
    }

    var addEvent = function (parent, childSelector, eventName, callback) {
        if (null === parent) {
            addEventForElement(childSelector, eventName, callback);
        } else {
            addEventForChild(parent, childSelector, eventName, callback);
        }
    };

    var addEventForElement = function (selector, eventName, callback) {
        var elements = document.querySelectorAll(selector);

        for (var i = 0; i < elements.length; ++i) {
            var element = elements[i]

            element.addEventListener(eventName, callback);
        }
    };

    var addEventForChild = function (parent, childSelector, eventName, callback) {
        var parents;
        var eParent;

        if (document === parent) {
            parents = [parent];
        } else {
            parents = document.querySelectorAll(parent);
        }

        for (var i = 0; i < parents.length; ++i) {
            var eParent = parents[i]

            eParent.addEventListener(eventName, function (event) {
                var clickedElement = event.target;
                var matchingChild = clickedElement.closest(childSelector)

                if (null !== matchingChild) {
                    callback(event)
                }
            });
        }
    };

    var addImageText = function (e, callback, strings) {
        if (typeof strings === 'undefined') {
            var strings = [e.value.substring(0, e.selectionStart), e.value.substring(e.selectionEnd, e.value.length)];
        }

        e.value = strings[0]
            + callback()
            + strings[1];

        e.selectionEnd = e.value.length - strings[1].length;

        return strings;
    }

    function init() {
        function api(/* element, selector, options */) {
            var element, selector, options;

            if (0 === arguments.length) {
                throw 'At least one argument required';
            } else if (1 === arguments.length) {
                element = null;
                selector = arguments[0];
                options = {};
            } else if (2 === arguments.length && 'object' === typeof arguments[1]) {
                element = null;
                selector = arguments[0];
                options = arguments[1];
            } else if (2 === arguments.length) {
                element = arguments[0];
                selector = arguments[1];
                options = {};
            } else {
                element = arguments[0];
                selector = arguments[1];
                options = arguments[2];
            }

            options = extend(api.options, options);

            addEvent(
                element,
                selector,
                'dragover',
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            )
            addEvent(
                element,
                selector,
                'dragenter',
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            )
            addEvent(
                element,
                selector,
                'drop',
                function (e) {
                    e.preventDefault();

                    var dt = e.dataTransfer;
                    var f = dt.files[0];
                    var t = e.target;

                    var customEvent = new CustomEvent('drop-upload:start', {
                        bubbles: true,
                        detail: {
                            originalEvent: e
                        }
                    });
                    t.dispatchEvent(customEvent);

                    var fd = new FormData();
                    fd.append(options['uploadKey'], f);

                    var request = new XMLHttpRequest();

                    var strings = addImageText(t, function () {
                        return options['uploadingCallback'](f.name);
                    });

                    request.ontimeout = function (postEvent) {
                        var customEvent = new CustomEvent('drop-upload:timeout', {
                            bubbles: true,
                            detail: {
                                originalEvent: e,
                                reason: 'timeout'
                            }
                        });
                        t.dispatchEvent(customEvent);
                    };
                    request.timeout = options['timeout'];
                    request.open('POST', options['uploadPath']);
                    request.onreadystatechange = function (postEvent) {
                        if (request.readyState === 4) {
                            var failed = false;
                            var failedReason = '';
                            if (request.status !== 0) {
                                try {
                                    var path = options['decodeResponseCallback'](postEvent.currentTarget.response);
                                    if (false === path) {
                                        throw Error('Decode error');
                                    }
                                } catch (err) {
                                    failed = true;
                                    failedReason = err.message;
                                }
                            } else {
                                failed = true;
                                failedReason = 'Communication error';
                            }

                            if (!failed) {
                                var customEvent = new CustomEvent('drop-upload:success', {
                                    bubbles: true,
                                    detail: {
                                        originalEvent: e,
                                        fileName: f.name,
                                        path: path
                                    }
                                });
                                t.dispatchEvent(customEvent);

                                addImageText(t, function () {
                                    return options['uploadedCallback'](f.name, path);
                                }, strings);
                            } else {
                                var customEvent = new CustomEvent('drop-upload:error', {
                                    bubbles: true,
                                    detail: {
                                        originalEvent: e,
                                        reason: failedReason
                                    }
                                });
                                t.dispatchEvent(customEvent);

                                addImageText(t, function () {
                                    return '';
                                }, strings);
                            }

                            var customEvent = new CustomEvent('drop-upload:end', {
                                bubbles: true,
                                detail: {
                                    originalEvent: e,
                                    success: !failed
                                }
                            });
                            t.dispatchEvent(customEvent);
                        }
                    };

                    request.send(fd);
                }
            );

        }

        api.options = {
            uploadPath: '/upload',
            uploadKey: 'file',
            uploadingCallback: function (fileName) {
                return '![Uploading ' + fileName + ']()';
            },
            uploadedCallback: function (fileName, path) {
                return '![' + fileName + '](' + path + ')';
            },
            decodeResponseCallback: function (response) {
                return response; // false or throw Error if failed
            },
            timeout: 0
        };

        return api;
    }

    return init();
}));
