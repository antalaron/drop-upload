Drop Upload
===========

Small JavaScript library to allow dropping files in textarea.

Installation
------------

Via npm:
```bash
$ npm install --save-dev drop-upload
```

Via bower:
```bash
$ bower install jquery-miller-columns
```

Manual installation:

Download the [latest release](https://github.com/antalaron/drop-upload/releases).

Via CDN:

```html
<script src="//cdn.jsdelivr.net/npm/drop-upload/dist/drop-upload.min.js"></script>
```

Dependecies
-----------

No dependency.

Usage
-----

Call on the desired element:

```javascript
DropUpload(document, 'textarea.uploadable-textarea');
```

First argument is the propagated target, second is the target selector (like in jQuery
`$(document).on('event', '.uploadable-textarea', function() {...})`), third is the options.

API reference
-------------

### Options

| Key                    | Default value                   | Description                             |
|:---------------------- |:------------------------------- |:--------------------------------------- |
| uploadPath             | /upload                         | Path to upload                          |
| uploadKey              | file                            | Key of the file in upload content       |
| uploadingCallback      | function (fileName) {...}       | The value in the textarea during upload |
| uploadedCallback       | function (fileName, path) {...} | The value in the textarea after upload  |
| decodeResponseCallback | function (response) {...}       | Decoding response                       |

### Events

| Event name          | Description               |
|:------------------- |:------------------------- |
| drop-upload:start   | Upload started            |
| drop-upload:end     | Upload ended              |
| drop-upload:success | Upload ended with success |
| drop-upload:error   | Upload failed             |


License
-------

This project is under [MIT License](http://opensource.org/licenses/mit-license.php).
