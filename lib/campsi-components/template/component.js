var Campsi = require('campsi-core');
var extend = require('extend');
var page = require('page');

module.exports = Campsi.extend('form', 'campsi/template', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                fields: [{
                    name: '_id',
                    type: 'text',
                    label: 'ID',
                    disabled: true
                }, {
                    name: 'name',
                    type: 'text',
                    label: 'name'
                }, {
                    name: 'locale',
                    type: 'text',
                    label: 'locale'
                }, {
                    label: 'icons',
                    name: 'icon',
                    type: 'file/image'
                }, {
                    label: 'tags',
                    name: 'tags',
                    type: 'tags'
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: 'identifier',
                    additionalClasses: ['identifier']
                }, {
                    name: 'fields',
                    type: 'campsi/component-list',
                    additionalClasses: ['collection_fields'],
                    label: 'fields'
                }]
            };
        },

        save: function () {

            var instance = this;

            if (instance.errors.length > 0) {
                alert('Errors, can\'t save');
                return false;
            }

            var ctx = instance.context;
            var url = ctx.apiURL('templates');
            var method = 'POST';

            if (instance.value._id) {
                url = ctx.apiURL('template');
                method = 'PUT';
            }

            var data = extend({}, instance.value);

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(data)
            }).done(function (data) {
                var newValue = extend({}, instance.value, data);
                instance.trigger('saved');
                ctx.invalidate('templates', function () {
                    ctx.set('template', newValue, function () {
                        page(ctx.applicationURL('template', {template: newValue}));
                    });
                });
            }).error(function () {
                instance.trigger('save-error');
            });
        }
    }
});