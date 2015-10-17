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
                    name: 'identifier',
                    type: 'text',
                    label: 'identifier',
                    additionalClasses: ['identifier']
                }, {
                    name: 'uri',
                    type: 'text',
                    label: 'uri',
                    additionalClasses: ['uri'],
                    disabled: true
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
                        }, {
                            name: 'markup',
                            type: 'campsi/code-editor',
                            mode: 'ace/mode/handlebars'
                        }]
                    }
                }]
            }
        },


        resolveParam: function (param) {
            if (param === 'project') {
                return this.value.__project.identifier || this.value.__project._id;
            }
            if (param === 'collection') {
                return this.value.identifier || this.value._id;
            }
        },

        attachEvents: function () {

            $super.attachEvents.call(this);

            var templates = this.fields.templates;
            templates.nodes.label.on('click', function () {
                templates.mountNode.toggleClass('closed');
            });
        },

        load: function (project, collection, next) {
            var instance = this;
            $.getJSON(Campsi.urlApi(project, collection), function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },


        save: function () {

            var instance = this;
            var url = Campsi.urlApi(instance.value.__project, instance.value);
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
                _id: this.value._id,
                __project: this.value.__project,
                identifier: this.value.identifier
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(this, function () {
                instance.fields.uri.setValue('http://campsi.io/api/v1' + Campsi.url(instance.value.__project, instance.value), function(){
                    next();
                });
            });
        }

    }
});