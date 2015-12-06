var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var page = require('page');
var slug = require('slug');

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
                    name: 'icon',
                    type: 'file/image',
                    label: 'icon',
                    additionalClasses: ['icon', 'horizontal']
                },  {
                    name: 'identifier',
                    type: 'text',
                    label: this.context.translate('panels.project.fields.identifier'),
                    additionalClasses: ['horizontal']
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

        processValue: function(data, cb){

            if ((typeof data.identifier === 'undefined' || data.identifier === '')
                && typeof data.title === 'string') {
                data.identifier = slug(data.title);
            }

            cb([], data);
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

            this.mountNode.closest('.panel').toggleClass('new', (typeof this.value._id === 'undefined'));
            //console.info(typeof this.value._id, this.value, this.mountNode);

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
                data.collections = instance.value.collections;
                delete data['__v'];
                delete data['roles'];
                delete data['id'];

                instance.setValue(data, function () {
                    instance.trigger('saved');
                    instance.context.invalidate('projects');
                    instance.context.set('project', instance.value);
                    instance.trigger('reset');
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