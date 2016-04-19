var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var page = require('page');
var slug = require('slug');
var extend = require('extend');

module.exports = Campsi.extend('component', 'campsi/project', function ($super) {

    return {

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('form', {options: instance.getFormOptions(), context: instance.context}, function (form) {
                    instance.form = form;
                    instance.nodes.form = form.render();
                    instance.mountNode.append(instance.nodes.form);
                    next();
                });
            })
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                Campsi.wakeUp(instance.nodes.form, context, function (form) {
                    instance.form = form;
                    instance.value = extend({}, instance.value, instance.form.value);
                    next();
                });
            });
        },

        attachEvents: function () {
            var instance = this;
            this.form.attachEvents();
            this.form.bind('change', function () {
                instance.setValue(extend({}, instance.value, instance.form.value));
            });
        },

        getNodePaths: function () {
            return {
                form: '> .component.form'
            }
        },

        getFormOptions: function () {

            return {
                fields: [{
                    name: 'title',
                    type: 'text',
                    required: true,
                    label: this.context.translate('panels.project.fields.title.label'),
                    additionalClasses: ['title'],
                    placeholder: this.context.translate('panels.project.fields.title.placeholder')
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: this.context.translate('panels.project.fields.ID.label'),
                    additionalClasses: ['identifier'],
                    placeholder: this.context.translate('panels.project.fields.ID.placeholder')
                }, {
                    name: 'icon',
                    type: 'file/image',
                    label: this.context.translate('panels.project.fields.icon'),
                    additionalClasses: ['icon'],
                    autoUpload: true
                }, {
                    name: 'url',
                    type: 'url',
                    label: this.context.translate('panels.project.fields.url')
                }, {
                    name: 'notes',
                    type: 'text/area',
                    additionalClasses: ['notes'],
                    label: this.context.translate('panels.project.fields.notes.label')
                }, {
                    name: 'collections',
                    type: 'campsi/collection-list',
                    label: this.context.translate('panels.project.fields.collections.label')
                }]
            }
        },

        getDefaultValue: function () {
            return {
                collections: []
            }
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

            this.form.setValue(this.value, next);
        },

        save: function () {

            var instance = this;
            if (typeof instance.context.user === 'undefined') {
                instance.trigger('login');
                return false;
            }

            if (instance.errors.length > 0) {
                alert('Errors, can\'t save');
                return false;
            }

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
                delete data.__v;
                delete data.roles;
                delete data.id;

                instance.trigger('saved');
                instance.context.setExpired('projects');
                instance.context.set('project', data, function () {
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
                        instance.context.setExpired('projects');
                        page('/projects/new');
                    });
                }).error(function () {
                    console.error('could not delete', err);
                });
            }
        },

        //optionsDidChange: function (next) {
        //    var instance = this;
        //    $super.optionsDidChange.call(this, function () {
        //        instance.form.fields.collections.component.newItem.setOptions({templates: instance.options.templates}, next);
        //    });
        //},

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