var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var page = require('page');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('form', 'campsi/project', function ($super) {

    return {

        getDefaultOptions: function () {

            return {
                fields: [{
                    name: 'title',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title'],
                    placeholder: 'Project title'
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: 'identifier',
                    additionalClasses: ['identifier']
                }, {
                    name: 'url',
                    type: 'handlebars',
                    label: 'URL',
                    template: '<a href="{{this}}">{{this}}</a>',
                    additionalClasses: ['url']
                }, {
                    label: 'Icon',
                    name: 'icon',
                    type: 'file/image',
                    additionalClasses: ['icon']
                }, {
                    name: 'collections',
                    label: 'Collections',
                    type: 'campsi/collection-list',
                    additionalClasses: ['collections']
                }]
            }
        },

        getDefaultValue: function () {
            return {
                collections: []
            }
        },

        attachEvents: function () {

            $super.attachEvents.call(this);

            var instance = this;

            instance.fields.collections.bind('design', function (id) {
                instance.trigger('design-collection', id);
            });
            instance.fields.collections.bind('admin', function (id) {
                instance.trigger('admin-collection', id);
            });
            instance.fields.collections.bind('create-collection', function (template) {
                return page(Campsi.url(instance.value) + '/collections/new');
            });
        },

        valueDidChange: function (next) {

            if (this.value.roles) {
                var isDesigner = (this.value.roles.indexOf('designer') > -1);
                var isAdmin = (this.value.roles.indexOf('admin') > -1);
                this.mountNode.toggleClass('admin', isAdmin);
                this.mountNode.toggleClass('designer', isDesigner);
            }

            $super.valueDidChange.call(this, next);
        },

        save: function () {

            var instance = this;
            var projectUrl = '/api/v1/projects';
            var method = 'POST';

            if (instance.value._id) {
                projectUrl += '/' + instance.value._id;
                method = 'PUT';
            }

            $.ajax({
                url: projectUrl,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function (data) {
                instance.value = data;
                instance.trigger('saved');
                instance.trigger('reset', Campsi.url(instance.value));
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        delete: function () {
            var instance = this;

            if (this.value._id) {
                $.ajax({
                    url: Campsi.urlApi(this.value),
                    method: 'DELETE'
                }).done(function () {
                    console.info("deleted");
                    instance.setValue(instance.getDefaultValue(), function () {
                        instance.trigger('reset');
                        page('/projects');
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