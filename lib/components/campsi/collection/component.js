var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var isBrowser = require('is-browser');

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
                    name: 'url',
                    type: 'handlebars',
                    label: 'URL',
                    additionalClasses: ['url'],
                    template: '<a href="{{this}}">{{this}}</a>'
                }]
            }
        },

        save: function () {

            var instance = this;
            var project = this.options.context._project;
            var url = Campsi.urlApi(project) + '/collections';
            var method = 'POST';
            if (instance.value._id) {
                url = Campsi.urlApi(project, instance.value);
                method = 'PUT';
            }

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function (data) {
                instance.setValue(extend(data, instance.value), function () {
                    instance.trigger('saved');
                    instance.trigger('reset', Campsi.url(project, instance.value));
                })
            }).error(function () {
                instance.trigger('save-error');
            });
        },


        delete: function () {
            var instance = this;
            var project = this.options.context._project;
            if (this.value._id) {
                $.ajax({
                    url: Campsi.urlApi(project, this.value),
                    method: 'DELETE'
                }).done(function () {
                    instance.setValue(undefined, function () {
                        instance.trigger('reset', Campsi.url(project));
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