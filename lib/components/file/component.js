var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');
var FileDrop;

if (isBrowser) {
    FileDrop = window.FileDrop;
}

module.exports = Campsi.extend('component', 'file', function ($super) {

    return {

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


            var instance = this;

            // FileList might contain multiple items.



            if (typeof this.dropzone === 'undefined') {

                this.dropzone = new FileDrop(this.nodes.dropzone[0], {url: window.CONF.upload_url});
                this.dropzone.event('send', function (files) {
                    // FileList might contain multiple items.
                    var $progress = $('<div class="progress"></div>').circleProgress({
                        value: 0.8,
                        startAngle: -Math.PI / 2,
                        animation: true,
                        fill: {gradient: ['#496BE1', '#0ACFD2']}
                    });

                    instance.nodes.dropzone.append($progress);

                    files.each(function (file) {
                        instance.onUploadStart();

                        file.event('progress', function (current, total) {
                            $progress.circleProgress('value', current / total);
                        });
                        file.event('done', function (xhr) {
                            $progress.remove();
                            instance.setValue(JSON.parse(xhr.response), function () {
                                instance.trigger('change');
                            });
                        });
                        file.sendTo(window.CONF.upload_url);
                    })
                });

                this.dropzone.event('iframeDone', function (xhr) {
                    instance.setValue(JSON.parse(xhr.response), function () {
                        instance.trigger('change');
                    });
                });
            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                dropzone: '> .file-dropzone',
                file: '> .file-dropzone > .file'
            });
        },

        onUploadStart: function(){

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