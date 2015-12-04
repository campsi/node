var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var page = require('page');

module.exports = Campsi.extend('form', 'campsi/collection', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'name',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    name: 'icon',
                    type: 'file/image',
                    label: 'icon',
                    additionalClasses: ['icon', 'horizontal']
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: this.context.translate('panels.collection.fields.identifier'),
                    additionalClasses: ['horizontal']
                }, {
                    label: this.context.translate('panels.collection.fields.templates'),
                    additionalClasses: ['horizontal'],
                    name: 'editTemplates',
                    type: 'button',
                    text: this.context.translate('panels.collection.fields.templates.btn')
                }, {
                    name: 'url',
                    type: 'handlebars',
                    label: this.context.translate('panels.collection.fields.URL'),
                    additionalClasses: ['url'],
                    template: '<a href="{{this}}" target="_blank">{{this}}</a>'
                }]
            }
        },

        attachEvents: function () {
            $super.attachEvents.call(this);
            var instance = this;
            this.fields.editTemplates.component.mountNode.on('click', function () {
                editor = window.open('/editor');
                editor.onload = function () {
                    editor.setValue(instance.value, function (collection) {
                        instance.templateChangeHandler(collection);
                    });
                }
            });
        },

        valueDidChange: function (next) {
            this.value.url = this.context.applicationURL('collection');
            $super.valueDidChange.call(this, next);
        },

        templateChangeHandler: function (collection) {
            this.value.templates = collection.templates;
            this.save({templates: this.value.templates});
        },

        save: function (data) {

            var instance = this;
            var ctx = instance.context;
            var url = ctx.apiURL('project') + '/collections';
            var method = 'POST';
            if (instance.value._id) {
                url = ctx.apiURL('collection');
                method = 'PUT';
            }

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(data || instance.value)
            }).done(function (data) {
                var newValue = extend({}, data, instance.value);

                console.info('old', instance.value, 'new', newValue)
                instance.setValue(newValue, function () {
                    instance.trigger('saved');
                    ctx.invalidate('collection');
                    ctx.invalidate('project');
                    ctx.set('collection', newValue);
                    instance.trigger('reset');
                    page(ctx.applicationURL('collection'));
                });
            }).error(function () {
                instance.trigger('save-error');
            });
        },


        delete: function () {
            var instance = this;
            var ctx = this.context;
            if (this.value._id) {
                $.ajax({
                    url: this.context.apiURL('collection'),
                    method: 'DELETE'
                }).done(function () {
                    instance.setValue(undefined, function () {
                        ctx.invalidate('collection');
                        ctx.invalidate('project');
                        page(ctx.applicationURL('project'));
                    });
                }).error(function () {
                    console.error('could not delete', err);
                });
            }
        },

        serializeValue: function () {
            return {
                _id: this.value._id,
                identifier: this.value.identifier
            }
        },

        serializeOptions: function () {
        }

    }
});