var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var page = require('page');
var slug = require('slug');
var async = require('async');

module.exports = Campsi.extend('component', 'campsi/collection', function ($super) {

    return {

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                async.parallel([
                    function (cb) {
                        Campsi.create('form', {
                            context: instance.context,
                            options: instance.getFormOptions()
                        }, function (form) {
                            instance.form = form;
                            cb();
                        });
                    }
                ], function onCollectionInit() {
                    instance.mountNode.append(instance.form.render());
                    next();
                })
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.form, context, function (form) {
                    instance.form = form;
                    instance.value = form.value;
                    next();
                });
            });
        },

        getNodePaths: function () {
            return {
                form: '.component.form'
            }
        },

        getDefaultValue: function(){
            return {
                fields: []
            }
        },

        getFormOptions: function () {
            return {
                fields: [{
                    name: 'name',
                    label: this.context.translate('panels.collection.fields.name.label'),
                    type: 'text',
                    placeholder: this.context.translate('panels.collection.fields.name.placeholder'),
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: this.context.translate('panels.collection.fields.identifier'),
                    additionalClasses: ['horizontal', 'identifier']
                }, {
                    name: 'fields',
                    type: 'campsi/component-list',
                    additionalClasses: ['fields'],
                    label: this.context.translate('panels.collection.fields.fields')
                }]
            }
        },

        attachEvents: function () {

            $super.attachEvents.call(this);
            var instance = this;
            instance.form.attachEvents();
            instance.form.bind('change', function () {
                instance.setValue(extend({}, instance.value, instance.form.value));
            });

            if (typeof instance.form.fields.fields !== 'undefined') {
                instance.form.fields.fields.bind('editProperties', function (event) {
                    page(instance.context.applicationURL('fieldProperties', {fieldProperties: event.field}));
                });
            } else {
                console.error('Fields field is undefined');
            }
        },

        highlightField: function (fieldName) {
            var parts = fieldName.split('.');
            var selectors = [];

            parts.forEach(function (part) {
                selectors.push('[data-field-name="' + part + '"]');
            });

            this.mountNode.find('.campsi_collection-designer_field')
                .removeClass('highlight')
                .filter(selectors.join(' '))
                .addClass('highlight');

            this.mountNode.addClass('highlighted');
        },

        removeHighlighting: function () {
            this.mountNode.removeClass('highlighted');
            this.mountNode.find('.campsi_collection-designer_field')
                .removeClass('highlight');
        },

        processValue: function (data, cb) {

            if (typeof data._id !== 'undefined') {

                if ((typeof data.identifier === 'undefined' || data.identifier === '')
                    && typeof data.name === 'string') {
                    data.identifier = slug(data.name);
                }

                data.url = this.context.config.host + this.context.apiURL('collection', {collection: data}, false) + '/entries';
            }

            cb([], data);
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

            data = data || instance.value;

            var safePayload = {};
            if (data.fields) {
                safePayload.fields = data.fields;
            }
            if (data.icon) {
                safePayload.icon = data.icon;
            }
            if (data.name) {
                safePayload.name = data.name;
            }
            if (data.identifier) {
                safePayload.identifier = data.identifier;
            }

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(safePayload)
            }).done(function (data) {
                var newValue = extend({}, data, instance.value);
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
        },

        valueDidChange: function (next) {
            this.form.setValue(this.value, function () {
                next();
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(instance, function () {
                if (instance.options.hightlightedField) {
                    instance.highlightField(instance.options.hightlightedField);
                }
                next();
            });
        }

    }
});