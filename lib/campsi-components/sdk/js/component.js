'use strict';
var Campsi = require('campsi-core');
var async = require('async');
module.exports = Campsi.extend('campsi/sdk', 'campsi/sdk/js', function () {
    return {
        getDefaultOptions: function () {
            return {
                name: this.context.translate('sdk.js.name'),
                title: this.context.translate('sdk.js.title'),
                intro: this.context.translate('sdk.js.intro'),
                steps: [
                    {
                        title: this.context.translate('sdk.js.lib.title'),
                        blocks: [
                            this.context.translate('sdk.js.lib.text'),
                            {
                                type: 'code',
                                language: 'html',
                                value: '<script src="https://campsi.io/campsi-sdk.min.js"></script>'
                            }
                        ]
                    },
                    {
                        title: this.context.translate('sdk.js.template.title'),
                        blocks: [
                            this.context.translate('sdk.js.template.text'),
                            {
                                type: 'code',
                                language: 'handlebars'
                            }
                        ]
                    }
                ]
            };
        },
        generateIntegrationCode: function (callback) {
            var fieldTemplates = [];
            var collection = this.value;
            var url = this.context.apiURL('entries', { collection: this.value }, false);
            var template = '<script type="text/x-handlebars-template+campsi"\n' + '        data-url="' + url + '">\n' + '<div class="' + collection.identifier + '">\n' + '    <h2>' + collection.name + '</h2>\n' + '    {{#each entries}}\n' + '        <div class="entry">{{ fields }}\n' + '        </div>\n' + '    {{/each}}\n' + '</div>\n' + '</script>';
            async.forEachOf(collection.fields, function getFieldTemplate(field, index, cb) {
                Campsi.get(field.type, function (Component) {
                    Component.prototype.getTemplate(field, function onFieldTemplate(fieldTemplate) {
                        fieldTemplate = '\n<div class="' + field.name + '">' + fieldTemplate + '</div>';
                        fieldTemplates[index] = fieldTemplate.replace(/this/g, 'data.' + field.name).replace(/arrayItem/g, 'this');
                        cb();
                    });
                });
            }, function allFieldsTemplated() {
                callback(template.replace('{{ fields }}', fieldTemplates.join('').replace(new RegExp('\n', 'g'), '\n            ')));
            });
        },
        valueDidChange: function (next) {
            var instance = this;
            this.generateIntegrationCode(function (template) {
                instance.steps[1].blocks[1].setValue(template);
                next();
            });
        }
    };
});