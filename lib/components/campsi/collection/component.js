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

        },

        load: function (project, collection, next) {
            var instance = this;

            if (typeof collection === 'undefined') {
                $.getJSON(Campsi.urlApi(project), function (data) {
                    instance.setValue(extend({}, instance.getDefaultValue(), {__project: data}), function () {
                        next();
                    });
                });
            } else {
                $.getJSON(Campsi.urlApi(project, collection), function (data) {
                    instance.setValue(data, function () {
                        instance.trigger('reset');
                        next();
                    });
                });
            }
        },


        save: function () {

            var instance = this;
            var project = instance.value.__project;

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
            var currentProject = this.value.__project;

            if (this.value._id) {
                $.ajax({
                    url: Campsi.urlApi(currentProject, this.value),
                    method: 'DELETE'
                }).done(function () {
                    console.info("deleted");
                    var newValue = extend({}, instance.getDefaultValue(), {__project: currentProject});
                    instance.setValue(newValue, function () {
                        instance.trigger('reset', Campsi.url(currentProject));
                    });
                }).error(function () {
                    console.error('could not delete', err);
                });
            }
        },

        serializeValue: function () {
            return {
                _id: this.value._id,
                __project: this.value.__project,
                identifier: this.value.identifier
            }
        },

        serializeOptions: function () {
        }

    }
});