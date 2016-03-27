var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');

module.exports = Campsi.extend('component', 'file', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                renderer: {
                    type: 'file/renderer'
                }
            };
        },

        getHtml: function (data, options, callback) {
            return callback(data.name);
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('uploader', {
                    options: {
                        multiple: false
                    },
                    context: instance.context
                }, function (uploader) {
                    instance.uploader = uploader;
                    instance.nodes.renderer = $('<div class="renderer"></div>');
                    instance.mountNode.append(instance.nodes.renderer);
                    instance.mountNode.append(instance.uploader.render());
                    instance.createRenderer(instance.getDefaultOptions().renderer.type, next);
                });
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                async.parallel([
                    function (cb) {
                        Campsi.wakeUp(instance.nodes.uploader, context, function (comp) {
                            instance.uploader = comp;
                            cb();
                        });
                    },
                    function (cb) {
                        Campsi.wakeUp(instance.nodes.renderer.find('> .component'), context, function (comp) {
                            instance.renderer = comp;
                            cb();
                        });
                    }
                ], next);
            });
        },

        attachEvents: function () {
            this.renderer.attachEvents();
            this.uploader.attachEvents();

            var instance = this;
            this.uploader.bind('change', function () {
                instance.setValue(instance.uploader.value[0], function () {
                    console.info("uploader changed, set file value");
                });
            });

            this.mountNode.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
            }).on('dragover dragenter', function () {
                $(this).addClass('is-dragover');
            }).on('dragleave dragend drop', function () {
                $(this).removeClass('is-dragover');
            }).on('drop', function (e) {
                instance.uploader.nodes.input[0].files = e.originalEvent.dataTransfer.files;
            })
        },

        getNodePaths: function () {
            return {
                uploader: '.component.uploader',
                renderer: '.renderer'
            };
        },

        createRenderer: function (type, next) {
            var instance = this;
            Campsi.create(type, {context: instance.context, value: instance.value}, function (comp) {
                instance.renderer = comp;
                instance.nodes.renderer.empty().append(comp.render());
                next();
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            instance.uploader.setOptions(instance.options, function () {
                instance.createRenderer(instance.options.renderer.type, next)
            });
        },

        valueDidChange: function (next) {
            if (this.renderer) {
                return this.renderer.setValue(this.value, next)
            }
            next();
        }
    }
});