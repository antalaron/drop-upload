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

    var addEventForChild = function (parent, childSelector, eventName, callback) {
        parent.addEventListener(eventName, function (event) {
            var clickedElement = event.target;
            var matchingChild = clickedElement.closest(childSelector)

            if (null !== matchingChild) {
                callback(event)
            }
        })
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
        function api(element, selector, options) {
            options = extend(api.options, options);

            addEventForChild(
                element,
                selector,
                'dragover',
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            )
            addEventForChild(
                element,
                selector,
                'dragenter',
                function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            )
            addEventForChild(
                element,
                selector,
                'drop',
                function (e) {
                    e.preventDefault();

                    var dt = e.dataTransfer;
                    var f = dt.files[0];
                    var t = e.target;

                    var customEvent = new CustomEvent('drop-upload:start', e);
                    t.dispatchEvent(customEvent);

                    var fd = new FormData();
                    fd.append(options['uploadKey'], f);

                    var request = new XMLHttpRequest();

                    var strings = addImageText(t, function () {
                        return options['uploadingCallback'](f.name);
                    });

                    request.open('POST', options['uploadPath']);
                    request.onreadystatechange = function (postEvent) {
                        if (request.readyState === 4) {
                            var failed = false;
                            var failedReason = '';
                            if (request.status === 200) {
                                var path = options['decodeResponseCallback'](postEvent.currentTarget.response);
                                if (false === path) {
                                    failed = true;
                                    failedReason = 'Decode';
                                }
                            } else {
                                failed = true;
                                failedReason = 'Communication: ' + request.status + ' ' + request.statusText;
                            }

                            if (!failed) {
                                var customEvent = new CustomEvent('drop-upload:success', e);
                                customEvent.fileName = f.name;
                                customEvent.path = path;
                                t.dispatchEvent(customEvent);

                                addImageText(t, function () {
                                    return options['uploadedCallback'](f.name, path);
                                }, strings);
                            } else {
                                var customEvent = new CustomEvent('drop-upload:error', e);
                                customEvent.reason = failedReason;
                                t.dispatchEvent(customEvent);

                                addImageText(t, function () {
                                    return '';
                                }, strings);
                            }

                            var customEvent = new CustomEvent('drop-upload:end', e);
                            customEvent.success = !failed;
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
                return response; // false if failed
            }
        };

        return api;
    }

    return init();
}));
