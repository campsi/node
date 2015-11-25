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
                    placeholder: this.context.translate('panels.project.fields.title'),
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: this.context.translate('panels.project.fields.identifier'),
                    additionalClasses: ['identifier', 'horizontal']
                }, {
                    name: 'icon',
                    type: 'file/image',
                    additionalClasses: ['icon']
                }, {
                    name: 'websiteUrl',
                    type: 'text',
                    label: this.context.translate('panels.project.fields.website'),
                    additionalClasses: ['website', 'horizontal']
                }, {
                    name: 'collections',
                    label: this.context.translate('panels.project.fields.collections'),
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
                var url = instance.context.applicationURL('collection', {collection: 'new'});
                if (template !== 'empty') {
                    url += '?template=' + template;
                }
                page(url);
            });
        },

        valueDidChange: function (next) {
            if (this.value.roles) {
                var isDesigner = (this.value.roles.indexOf('designer') > -1);
                var isAdmin = (this.value.roles.indexOf('admin') > -1);
                this.mountNode.toggleClass('admin', isAdmin);
                this.mountNode.toggleClass('designer', isDesigner);
            }

            if (this.value.demo === true) {
                this.mountNode.addClass('admin');
                this.mountNode.addClass('designer');
            }

            $super.valueDidChange.call(this, next);
        },

        save: function () {

            var instance = this;
            var projectUrl = this.context.apiURL('projects');
            var method = 'POST';

            if (instance.value._id) {
                projectUrl = this.context.apiURL('project');
                method = 'PUT';
            }

            $.ajax({
                url: projectUrl,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function (data) {
                instance.setValue(data, function () {
                    instance.trigger('saved');
                    instance.context.invalidate('projects');
                    instance.context.set('project', instance.value);
                    page(instance.context.applicationURL('project'));
                });
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        delete: function () {
            var instance = this;

            if (this.value._id) {
                $.ajax({
                    url: instance.context.apiURL('project'),
                    method: 'DELETE'
                }).done(function () {
                    instance.setValue(instance.getDefaultValue(), function () {
                        // todo reset all ?
                        page('/projects');
                    });
                }).error(function () {
                    console.error('could not delete', err);
                });
            }
        },

        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(this, function () {
                instance.fields.collections.component.newItem.setOptions({templates: instance.options.templates}, next);
            })
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