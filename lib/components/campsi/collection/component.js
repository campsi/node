var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'name',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    label: 'templates',
                    name: 'templates',
                    additionalClasses: ['templates', 'closed'],
                    type: 'array',
                    items: {
                        type: 'form',
                        fields: [{
                            name: 'identifier',
                            placeholder: 'template identifier',
                            type: 'text',
                            additionalClasses: ['invisible']
                        },{
                            name: 'markup',
                            type: 'campsi/code-editor',
                            mode: 'ace/mode/handlebars'
                        }]
                    }
                }]
            }
        },

        attachEvents: function () {

            $super.attachEvents.call(this);

            var templates = this.fields.templates;
            templates.nodes.label.on('click', function () {
                templates.mountNode.toggleClass('closed');
            });
        },

        load: function (id, next) {
            var instance = this;
            var url = '/api/v1/collections/' + id;
            $.getJSON(url, function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },


        save: function () {

            var instance = this;
            var url = '/api/v1/collections/' + instance.value.id;
            var method = 'PUT';

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function () {
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        serializeValue: function () {
            return {
                id: this.value.id
            }
        }

    }
});