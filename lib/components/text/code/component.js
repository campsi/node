var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'text/code', function ($super) {

    return {

        getHtml: function (data, options, callback) {
            var str = String(data);
            callback($('<pre>').text(str.substring(0, str.indexOf('\n')) + '…'));
        },

        getDefaultValue: function () {
            return '';
        },

        getDefaultOptions: function () {
            return {
                theme: 'ace/theme/monokai',
                mode: 'html'
            };
        },

        getDesignerFormOptions: function () {

            function convertToOptionsList(obj) {
                var value;
                var list = [];
                for (value in obj) {
                    if (obj.hasOwnProperty(value)) {
                        list.push({
                            value: value,
                            label: obj[value]
                        });
                    }
                }
                return list;
            }


            return {
                fields: [{
                    type: 'select/dropdown',
                    name: 'mode',
                    label: 'Mode',
                    additionalClasses: ['horizontal'],
                    options: convertToOptionsList(require('./modes'))
                }, {
                    type: 'select/dropdown',
                    name: 'theme',
                    label: 'Theme',
                    additionalClasses: ['horizontal'],
                    options: convertToOptionsList(require('./themes'))
                }]
            }
        },

        attachEvents: function () {
            console.info("text/code attachEvents", this);

            var instance = this;

            if (typeof window.ace === 'undefined') {
                Campsi.loader.js('https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.3/ace.js', function () {
                    instance.initAceEditor();
                });
            } else if (typeof instance.editor === 'undefined') {
                instance.initAceEditor();
            }
        },

        initAceEditor: function () {
            var instance = this;
            instance.editor = window.ace.edit(instance.mountNode[0]);

            instance.editor.setTheme(instance.options.theme);
            instance.editor.getSession().setMode('ace/mode/' + instance.options.mode);
            instance.mountNode.css('font-size', '12px');
            instance.editor.getSession().on('change', function () {
                var editorValue = instance.editor.getValue();
                if (editorValue !== instance.value) {
                    instance.setValue(editorValue);
                }
            });
        },

        valueDidChange: function (next) {
            if (typeof this.editor === 'undefined') {
                this.mountNode.text(this.value);
            } else {
                var editorValue = this.editor.getValue();
                if (editorValue !== this.value) {
                    this.editor.setValue(this.value);
                }
            }
            next();
        },

        optionsDidChange: function (next) {
            if (typeof this.editor !== 'undefined') {
                this.editor.setTheme(this.options.theme);
                this.editor.getSession().setMode('ace/mode/' + this.options.mode);

            }
            next();
        }
    }
});