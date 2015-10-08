var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');
var FileDrop;

if (isBrowser) {
    FileDrop = window.FileDrop;
}

module.exports = Campsi.extend('component', 'file', function ($super) {

    return {

        getFileDropOptions: function () {
            return {
                url: 'http://files.campsi.io:8080',
                logging: false
            }
        },
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.file = $('<div class="file"></div>');
                instance.nodes.dropzone = $('<div class="file-dropzone"></div>');
                instance.nodes.dropzone.append(instance.nodes.file);
                instance.mountNode.append(instance.nodes.dropzone);
                next();
            });
        },

        attachEvents: function () {
            if (!isBrowser) {
                return;
            }

            var options = this.getFileDropOptions();
            var instance = this;
            if (typeof this.dropzone === 'undefined') {

                this.dropzone = new FileDrop(this.nodes.dropzone[0], this.getFileDropOptions());
                this.dropzone.event('send', function (files) {
                    // FileList might contain multiple items.
                    files.each(function (file) {
                        file.event('done', function (xhr) {
                            instance.setValue(JSON.parse(xhr.response), function () {
                                instance.trigger('change');
                            });
                        });
                        file.sendTo(options.url);
                    })
                });

                this.dropzone.event('iframeDone', function (xhr) {
                    instance.setValue(JSON.parse(xhr.response), function () {
                        instance.trigger('change');
                    });
                })


            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                dropzone: '> .file-dropzone',
                file: '> .file-dropzone > .file'
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(this, function () {
                if (typeof instance.value !== 'undefined') {
                    instance.nodes.file.text(instance.value.uri);
                }
                next();
            });
        }
    }
});