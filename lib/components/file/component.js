var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');


module.exports = Campsi.extend('component', 'file', function ($super) {

    return {

        getTagName: function () {
            return 'form';
        },

        init: function (next) {
            var instance = this;
            var $control;
            $super.init.call(this, function () {

                instance.mountNode.attr('enctype', 'multipart/form-data')
                instance.mountNode.append('<div class="value">');
                $control = $('<div class="control">');
                $control.append('<input type="file" name="files">');
                $control.append('&nbsp;<input type="submit">');
                instance.mountNode.append($control);
                instance.mountNode.append('<div class="progress">');
                next();
            });
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
            //$progress.circleProgress('value', current / total);
        },

        upload: function () {
            var instance = this;
            var data = new FormData(this.mountNode[0]);
            $.ajax({
                xhr: this.createXHR(),
                url: window.CONF.upload_url,
                type: 'POST',
                data: data,
                contentType: false,
                processData: false,
                cache: false,
                complete: function () {
                    //$form.removeClass('is-uploading');
                },
                success: function (data) {
                    instance.setValue(data, function () {
                        instance.mountNode.get(0).reset();
                    });
                },
                error: function () {
                    console.info("error");
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
                $(this).find('input[type=file]').get(0).files = e.originalEvent.dataTransfer.files;
            }).on('change', function () {
                if ($(this).find('input[type=file]').get(0).files.length > 0) {
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
                    instance.mountNode.find('.value').text(instance.value.uri);
                }
                next();
            });
        }
    }
});