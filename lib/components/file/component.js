var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');


module.exports = Campsi.extend('component', 'file', function ($super) {

    return {

        getTagName: function () {
            return 'form';
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {

                instance.mountNode.attr('enctype', 'multipart/form-data')

                instance.nodes.value = $('<div class="value">');
                instance.nodes.control = $('<div class="control">');
                instance.nodes.progress = $('<div class="progress">');
                instance.nodes.input = $('<input type="file" name="files">');
                instance.nodes.submit = $('<input type="submit">');

                instance.nodes.control.append(instance.nodes.input);
                instance.nodes.control.append('&nbsp;');
                instance.nodes.control.append(instance.nodes.submit);

                instance.mountNode.append(instance.nodes.value);
                instance.mountNode.append(instance.nodes.control);
                instance.mountNode.append(instance.nodes.progress);
                next();
            });
        },

        getNodePaths: function(){
            return {
                value: '.value',
                progress: '.progress',
                control: '.control',
                input: 'input[type=file]',
                submit: 'input[type=submit]'
            }
        },
        createXHR: function () {
            var xhr = new window.XMLHttpRequest();
            var instance = this;
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    instance.showProgress(evt.loaded / evt.total);
                }
            }, false);

            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    instance.showProgress(evt.loaded / evt.total);
                }
            }, false);

            return function () {
                return xhr;
            }
        },

        showProgress: function (value) {
            this.nodes.progress.css('width', value * 100 + '%');
            //$progress.circleProgress('value', current / total);
        },

        upload: function () {
            var instance = this;
            var data = new FormData(this.mountNode[0]);

            instance.nodes.progress.css('width', 0).show();

            $.ajax({
                xhr: this.createXHR(),
                url: window.CONF.upload_url,
                type: 'POST',
                data: data,
                contentType: false,
                processData: false,
                cache: false,
                complete: function () {
                    instance.nodes.progress.css('width', 0).hide();
                },
                success: function (data) {
                    instance.setValue(data, function () {
                        instance.mountNode.get(0).reset();
                    });
                },
                error: function (err) {
                    console.error("error during upload", err);
                }
            });
        },

        attachEvents: function () {
            if (!isBrowser || this.eventsAttached === true) {
                return;
            }

            var instance = this;
            var droppedFiles = false;

            this.mountNode.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
            }).on('dragover dragenter', function () {
                $(this).addClass('is-dragover');
            }).on('dragleave dragend drop', function () {
                $(this).removeClass('is-dragover');
            }).on('drop', function (e) {
                instance.nodes.input[0].files = e.originalEvent.dataTransfer.files;
            }).on('change', function () {
                if (instance.nodes.input[0].files.length > 0) {
                    $(this).addClass('has-files');
                }
            }).on('submit', function (e) {
                e.preventDefault();
                $(this).removeClass('has-files');
                instance.upload();
            });

            this.eventsAttached = true;
        },


        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(this, function () {
                if (typeof instance.value !== 'undefined') {
                    instance.nodes.value.text(instance.value.uri);
                }
                next();
            });
        }
    }
});