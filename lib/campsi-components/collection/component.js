'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var page = require('page');
var async = require('async');
module.exports = Campsi.extend('component', 'campsi/collection', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                async.parallel([
                    instance.createForm.bind(instance),
                    instance.createIntro.bind(instance),
                    instance.createDoc.bind(instance)
                ], function onCollectionInit() {
                    instance.mountNode.append(instance.intro.render());
                    instance.mountNode.append(instance.doc.render());
                    instance.mountNode.append(instance.form.render());
                    next();
                });
            });
        },
        createForm: function (cb) {
            var instance = this;
            Campsi.create('form', {
                context: instance.context,
                options: instance.getFormOptions()
            }, function (form) {
                instance.form = form;
                cb();
            });
        },
        createIntro: function (cb) {
            var instance = this;
            Campsi.create('campsi/collection/intro', {context: instance.context}, function (intro) {
                instance.intro = intro;
                cb();
            });
        },
        createDoc: function (cb) {
            var instance = this;
            Campsi.create('campsi/collection/api-doc', {context: instance.context}, function (doc) {
                instance.doc = doc;
                cb();
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                async.parallel([
                    function (cb) {
                        Campsi.wakeUp(instance.nodes.form, context, function (form) {
                            instance.form = form;
                            instance.value = extend({}, instance.value, form.value);
                            cb();
                        });
                    },
                    function (cb) {
                        Campsi.wakeUp(instance.nodes.doc, context, function (doc) {
                            instance.doc = doc;
                            cb();
                        });
                    },
                    function (cb) {
                        Campsi.wakeUp(instance.nodes.intro, context, function (intro) {
                            instance.intro = intro;
                            cb();
                        });
                    }
                ], next);
            });
        },
        getNodePaths: function () {
            return {
                form: '> .component.form',
                intro: '> .campsi_collection_intro',
                doc: '> .campsi_collection_api-doc'
            };
        },
        getDefaultValue: function () {
            return {fields: []};
        },
        getFormOptions: function () {
            return {
                fields: [
                    {
                        name: 'name',
                        label: this.context.translate('panels.collection.fields.name.label'),
                        type: 'text',
                        required: true,
                        placeholder: this.context.translate('panels.collection.fields.name.placeholder'),
                        additionalClasses: ['title']
                    },
                    {
                        name: 'identifier',
                        type: 'text',
                        label: this.context.translate('panels.collection.fields.identifier'),
                        additionalClasses: ['identifier']
                    },
                    {
                        name: 'fields',
                        type: 'campsi/component-list',
                        additionalClasses: ['fields'],
                        label: this.context.translate('panels.collection.fields.fields')
                    }
                ]
            };
        },
        attachEvents: function () {
            $super.attachEvents.call(this);
            var instance = this;
            instance.form.attachEvents();
            instance.form.bind('change', function () {
                instance.setValue(extend({}, instance.value, instance.form.value));
            });
            instance.doc.attachEvents();
            if (typeof instance.form.fields.fields !== 'undefined') {
                instance.form.fields.fields.bind('editProperties', function (event) {
                    page(instance.context.applicationURL('fieldProperties', {fieldName: event.field}));
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
            this.mountNode.find('.campsi_collection-designer_field').removeClass('highlight').filter(selectors.join(' ')).addClass('highlight');
            this.mountNode.addClass('highlighted');
        },
        removeHighlighting: function () {
            this.mountNode.removeClass('highlighted');
            this.mountNode.find('.campsi_collection-designer_field').removeClass('highlight');
        },
        getPayload: function (data) {
            data = data || this.value;
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
            return safePayload;
        },
        save: function (data) {
            var instance = this;
            if (instance.form.errors.length > 0) {
                alert('Errors, can\'t save');
                return false;
            }
            var safePayload = instance.getPayload(data);
            var ctx = instance.context;
            var url = ctx.apiURL('collections');
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
                data: JSON.stringify(safePayload)
            }).done(function (data) {
                instance.trigger('saved');
                ctx.setExpired(['project', 'collection']);
                page(ctx.applicationURL('collection', {collection: data}));
            }).error(function () {
                instance.trigger('save-error');
            });
        },
        delete: function () {
            var ctx = this.context;
            if (this.value._id) {
                $.ajax({
                    url: this.context.apiURL('collection'),
                    method: 'DELETE'
                }).done(function () {
                    ctx.setExpired('project');
                    page(ctx.applicationURL('project'));
                }).error(function () {
                    console.error('could not delete', err);
                });
            }
        },
        serializeValue: function () {
            return {
                _id: this.value._id,
                identifier: this.value.identifier
            };
        },
        serializeOptions: function () {
        },
        valueDidChange: function (next) {
            var instance = this;
            instance.form.setValue(instance.value, function () {
                instance.setTabIndex();
                instance.doc.setValue(instance.value, next);
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
        },
        setTabIndex: function () {
            this.form.mountNode.find('input, select').each(function (i) {
                $(this).attr('tabindex', i);
            });
        }
    };
});