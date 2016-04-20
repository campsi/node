'use strict';
var Campsi = require('campsi-core');
var isBrowser = require('is-browser');
var $ = require('cheerio-or-jquery');
var async = require('async');
module.exports = Campsi.extend('component', 'campsi/reference', function ($super) {
    return {
        getHtml: function (data, options, callback) {
            if (!Array.isArray(data)) {
                data = [data];
            }
            var links = [];
            data.forEach(function (id) {
                links.push($('<span class="reference">').text(id));
            });
            callback(links);
        },
        getDesignerFormOptions: function () {
            return {
                fields: [
                    {
                        label: 'collectionOptions',
                        name: 'collection',
                        type: 'campsi/reference/collection-options'
                    },
                    {
                        label: 'queryString',
                        name: 'queryString',
                        type: 'text'
                    },
                    {
                        label: 'multiple',
                        name: 'multiple',
                        type: 'checkbox'
                    }
                ]
            };
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.get('form', function (FormComponent) {
                    instance.formComponent = FormComponent;
                    next();
                });
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.get('form', function (FormComponent) {
                    instance.formComponent = FormComponent;
                    next();
                });
            });
        },
        attachEvents: function () {
            var instance = this;
            if (instance.eventsAttached || !isBrowser) {
                return;
            }
            if (instance.options.collection) {
                instance.loadEntries();
            }
            instance.mountNode.on('change', 'input', function () {
                var newValue = [];
                instance.mountNode.find('input').each(function (i, input) {
                    if (input.checked) {
                        newValue.push($(input).val());
                    }
                });
                if (instance.options.multiple !== true && newValue.length > 0) {
                    newValue = newValue[0];
                }
                instance.setValue(newValue);
            });
            instance.eventsAttached = true;
        },
        getNodePaths: function () {
            return {};
        },
        loadEntries: function () {
            var instance = this;
            instance.entries = [];
            var collectionOptions = instance.options.collection.options;
            var mergeOptionsToFields = function (fields, parent) {
                fields.forEach(function (field) {
                    var path = parent ? parent + '/' + field.name : field.name;
                    field.hide = typeof collectionOptions[path] === 'undefined' || collectionOptions[path].hide !== false;
                    if (field.items && Array.isArray(field.items.fields)) {
                        mergeOptionsToFields(field.items.fields, path);
                    }
                    if (Array.isArray(field.fields)) {
                        mergeOptionsToFields(field.fields, path);
                    }
                });
            };
            var url = instance.options.collection.url;
            if (instance.options.queryString) {
                url += '?' + instance.options.queryString;
            }
            $.get(url).done(function (collection) {
                if (collectionOptions) {
                    mergeOptionsToFields(collection.fields);
                }
                $.get(collection._links.entries).done(function (result) {
                    async.forEachSeries(result.entries, function (entry, cb) {
                        instance.formComponent.prototype.getHtml(entry.data, collection, function (html) {
                            instance.entries.push({
                                _id: entry._id,
                                html: html,
                                url: entry._links.canonical
                            });
                            cb();
                        });
                    }, function () {
                        instance.renderEntries();
                    });
                });
            });
        },
        renderEntries: function () {
            var instance = this;
            instance.mountNode.empty();
            instance.entries.forEach(function (entry) {
                var $div = $('<div class="entry">');
                $div.append('<div class="input">');
                $div.find('.input').append($('<input>').attr({
                    name: instance.id,
                    value: entry._id,
                    type: instance.options.multiple ? 'checkbox' : 'radio'
                }));
                $div.append(entry.html);
                $div.attr('data-url', entry.url);
                instance.mountNode.append($div);
            });
            instance.updateInputs();
        },
        optionsDidChange: function (next) {
            if (!isBrowser) {
                return next();
            }
            if (this.eventsAttached && this.options.collection) {
                this.loadEntries();
            }
            next();
        },
        updateInputs: function () {
            var instance = this;
            var references = typeof instance.value === 'string' ? [instance.value] : instance.value;
            var $input;
            if (typeof references === 'undefined') {
                references = [];
            }
            instance.mountNode.find('input').each(function (i, input) {
                $input = $(input);
                $input.attr('checked', references.indexOf($input.val()) > -1);
            });
        },
        valueDidChange: function (next) {
            this.updateInputs();
            next();
        }
    };
});