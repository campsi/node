'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'text/rich', function ($super) {
    return {
        getHtml: function (data, options, callback) {
            callback(data);
        },
        getDefaultOptions: function () {
            return {
                toolbarButtons: [
                    'font',
                    'size',
                    'color',
                    'background',
                    'bold',
                    'italic',
                    'strike',
                    'underline',
                    'link',
                    'align',
                    'list',
                    'bullet'
                ],
                allowedTextColors: [],
                allowedBackgroundColors: [],
                allowedFonts: [
                    'serif',
                    'sans-serif',
                    'monospace'
                ]
            };
        },
        getDesignerFormOptions: function () {
            return {
                fields: [{
                        name: 'toolbarButtons',
                        label: 'toolbar buttons',
                        type: 'checkbox/group',
                        options: [
                            {
                                label: 'Font',
                                value: 'font'
                            },
                            {
                                label: 'Size',
                                value: 'size'
                            },
                            {
                                label: 'Color',
                                value: 'color'
                            },
                            {
                                label: 'Background Color',
                                value: 'background'
                            },
                            {
                                label: 'Bold',
                                value: 'bold'
                            },
                            {
                                label: 'Italic',
                                value: 'italic'
                            },
                            {
                                label: 'Strike',
                                value: 'strike'
                            },
                            {
                                label: 'Underline',
                                value: 'underline'
                            },
                            {
                                label: 'Link',
                                value: 'link'
                            },
                            {
                                label: 'Align',
                                value: 'align'
                            },
                            {
                                label: 'List',
                                value: 'list'
                            },
                            {
                                label: 'Bullet',
                                value: 'bullet'
                            }
                        ]
                    }]
            };
        },
        getDefaultValue: function () {
            return '';
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.toolbar = $('<div class="toolbar">');
                instance.nodes.editor = $('<div class="editor">');
                instance.mountNode.append(instance.nodes.toolbar);
                instance.mountNode.append(instance.nodes.editor);
                next();
            });
        },
        attachEvents: function () {
            var instance = this;
            if (typeof window.Quill === 'undefined') {
                Campsi.loader.js('//cdn.quilljs.com/latest/quill.min.js', function () {
                    instance.initEditor();
                });
            } else if (typeof instance.editor === 'undefined') {
                instance.initEditor();
            }
        },
        initEditor: function () {
            var instance = this;
            try {
                instance.editor = new window.Quill(instance.mountNode.find('.editor').get(0));
                instance.editor.addModule('toolbar', { container: instance.mountNode.find('.toolbar').get(0) });
                instance.editor.on('text-change', function () {
                    instance.setValue(instance.editor.getHTML());
                });
            } catch (err) {
                console.error(err);
            }
        },
        getNodePaths: function () {
            return {
                'toolbar': '.toolbar',
                'editor': '.editor'
            };
        },
        optionsDidChange: function (next) {
            var instance = this;
            var buttons = [];
            instance.options.toolbarButtons.forEach(function (button) {
                var $btn = $('<button>');
                $btn.addClass('ql-' + button);
                $btn.text(button);
                buttons.push($btn);
            });
            instance.nodes.toolbar.empty().append(buttons);
            next();
        },
        valueDidChange: function (next) {
            if (typeof this.editor === 'undefined') {
                this.nodes.editor.html(this.value);
            } else {
                if (this.editor.getHTML() !== this.value) {
                    this.editor.setHTML(this.value);
                }
            }
            next();
        }
    };
});