var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');
module.exports = Campsi.extend('component', 'campsi/sdk/js', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.textarea = $('<textarea disabled>');
                instance.mountNode.append(instance.nodes.textarea);
                next();
            });
        },

        getNodePaths: function () {
            return {
                textarea: 'textarea'
            };
        },

        optionsDidChange: function (next) {
            next();
        },

        generateIntegrationCode: function (callback) {

            var fieldTemplates = [];

            this.context.get('collection', function (collection) {
                console.info(collection);

                var template = '<script type="text/x-handlebars-template+campsi"\n' +
                    '        data-project="' + collection._project + '"\n' +
                    '        data-collection="' + collection._id + '">\n' +
                    '<div class="' + collection.identifier + '">\n' +
                    '    <h2>' + collection.name + '</h2>\n' +
                    '    {{#each entries}}\n' +
                    '        <div class="entry">{{ fields }}\n' +
                    '        </div>\n' +
                    '    {{/each}}\n' +
                    '</div>\n' +
                    '</script>';

                async.forEachOf(collection.fields, function getFieldTemplate(field, index, cb) {
                    Campsi.get(field.type, function (Component) {
                        Component.prototype.getTemplate(field, function onFieldTemplate(fieldTemplate) {
                            fieldTemplate = '\n<div class="' + field.name + '">' + fieldTemplate + '<div>';
                            fieldTemplates[index] = fieldTemplate.replace('this', 'data.' + field.name);
                            cb();
                        });
                    });
                }, function allFieldsTemplated() {
                    callback(template.replace('{{ fields }}', fieldTemplates.join('').replace(new RegExp('\n', 'g'), '\n            ')));
                });
            });
        },

        valueDidChange: function (next) {
            var instance = this;

            this.generateIntegrationCode(function (template) {
                instance.nodes.textarea.val(template);
                next();
            })
        }
    }
});