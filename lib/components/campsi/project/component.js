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

        resolveParam: function (param) {
            if (param === 'project') {
                return this.value.identifier || this.value._id;
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

                //if (template.empty) {
                    page(Campsi.url(instance.value) + '/collections/new');
                    return;
                //}

                $.ajax({
                    url: Campsi.urlApi(instance.value) + '/collections?template=' + template._id,
                    method: 'POST',
                    contentType: 'application/json'
                }).done(function (data) {
                    instance.value.collections.push(data);
                    instance.fields.collections.setValue(instance.value.collections, function () {
                        page(Campsi.url(instance.value, data)); // dispatch global event
                    });
                });
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            this.value.collections.forEach(function (collection) {
                collection.__project = {
                    _id: instance.value._id,
                    identifier: instance.value.identifier
                };
            });

            var user;
            var isDesigner = false;
            var isAdmin = false;

            if (this.value._id) {

                if (isBrowser) {
                    user = window.CAMPSI_USER;
                } else {
                    user = this.options.context.user;
                }

                if (user) {
                    var userId = user._id.toString();
                    this.value.admins.forEach(function (admin) {
                        if (admin._id.toString() === userId) {
                            isAdmin = true;
                        }
                    }, this);

                    this.value.designers.forEach(function (designer) {
                        if (designer._id.toString() === userId) {
                            isDesigner = true
                        }
                    }, this);

                    this.mountNode.toggleClass('admin', isAdmin);
                    this.mountNode.toggleClass('designer', isDesigner);
                }
            }

            $super.valueDidChange.call(this, next);
        },

        load: function (id, next) {
            var instance = this;
            var projectUrl = '/api/v1/projects/' + id;
            $.getJSON(projectUrl, function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },

        reload: function (next) {
            var instance = this;
            var projectUrl = Campsi.urlApi(this.value);
            $.getJSON(projectUrl, function (data) {
                instance.setValue(data, next)
            });
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