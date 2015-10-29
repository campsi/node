var Campsi = require('campsi');
var async = require('async');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('component', 'form', function ($super) {

    return {

        getDefaultValue: function () {
            return {}
        },

        getDefaultOptions: function () {
            return {fields: []}
        },

        getDesignerFormOptions: function () {

            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'fields',
                label: 'fields',
                type: 'campsi/component-list',
                additionalClasses: ['form_fields']
            }]);
            return superOptions;
        },

        init: function (next) {

            this.fields = {};

            $super.init.call(this, function () {
                this.nodes.fields = $('<div class="fields"></div>');
                this.mountNode.append(this.nodes.fields);
                next.call(this);
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            var fieldName;

            this.fields = {};
            this.value = {};

            $super.wakeUp.call(instance, el, context, function () {
                async.forEach(instance.nodes.fields.find('> .component').toArray(), function (componentEl, cb) {
                    Campsi.wakeUp(componentEl, context, function (componentInstance) {
                        var fieldExistsInOptions = false;
                        componentInstance.parent = instance;
                        fieldName = componentInstance.options.name;
                        instance.options.fields.forEach(function (field) {
                            if (field.name === fieldName) {
                                fieldExistsInOptions = true;
                            }
                        });

                        instance.fields[fieldName] = componentInstance;
                        if (!fieldExistsInOptions) {
                            instance.options.fields.push(componentInstance.options);
                        }
                        instance.value[fieldName] = componentInstance.value;
                        cb.call(null)
                    });
                }, function () {
                    instance.updateFields();
                    next.call(instance);
                });

            });
        },

        getFieldValue: function (fieldName) {
            if (this.value && this.value[fieldName]) {
                return this.value[fieldName];
            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'fields': '> .fields'
            });
        },


        eachField: function (fn) {
            if (typeof this.options === 'undefined') {
                this.options = this.getDefaultOptions();
            }
            this.options.fields.forEach(function (fieldOptions) {
                fn.call(this, this.fields[fieldOptions.name], fieldOptions.name);
            }, this)
        },

        attachEvents: function () {
            var instance = this;
            instance.eachField(function (fieldComponent, fieldName) {
                fieldComponent.attachEvents();
                instance.listenToFieldEvent(fieldName);
            });
        },

        listenToFieldEvent: function (fieldName) {
            var instance = this;

            instance.fields[fieldName].bind('change', function () {
                instance.value[fieldName] = this.value;
                instance.updateFields();
                instance.trigger('change');
            });
        },

        updateFields: function () {
            this.eachField(function (f) {
                f.update();
            });
        },

        hasFields: function () {
            return (
                typeof this.fields === 'undefined' ||
                typeof this.options === 'undefined' ||
                this.options.fields.length === 0
            );
        },

        valueDidChange: function (next) {
            if (this.hasFields()) {
                //console.info('form.valueDidChange', 'no fields created or no fields in options');
                return next.call(this);
            }

            var instance = this;

            async.eachSeries(instance.options.fields, function (fieldOptions, cb) {
                var fieldComponent = instance.fields[fieldOptions.name];

                if (typeof fieldComponent !== 'undefined') {
                    fieldComponent.setValue(instance.getFieldValue(fieldOptions.name), cb);
                } else {
                    cb.call();
                }

            }, function(){
                instance.updateFields();
                next();
            });
        },

        createField: function (fieldOptions, callback) {
            var instance = this;

            Campsi.create('form/field', {
                options: fieldOptions,
                value: instance.getFieldValue(fieldOptions.name),
                context: instance.context
            }, function (component) {
                component.parent = instance;
                instance.fields[fieldOptions.name] = component;
                if (isBrowser) {
                    instance.listenToFieldEvent(fieldOptions.name);
                    instance.fields[fieldOptions.name].attachEvents();
                }
                callback.call(instance, component.render());
            });
        },

        optionsDidChange: function (next) {

            var instance = this;
            var fieldOptions = this.options.fields;
            var fieldNodes = [];
            var fieldsToCreate = fieldOptions.length;
            var fieldsCreated = 0;
            var existingField;


            if (fieldsToCreate == 0) {
                instance.nodes.fields.empty();
                return next.call(this);
            }

            var allFieldsCreated = function () {
                instance.nodes.fields.empty();
                fieldOptions.forEach(function (fieldOption) {
                    instance.nodes.fields.append(fieldNodes[fieldOption.name]);
                });
                return next.call(this);
            };

            var removeObsoleteFields = function () {
                var fieldName;
                var newFieldNames = fieldOptions.map(function (fieldOption) {
                    return fieldOption.name
                });
                for (fieldName in instance.fields) {
                    if (instance.fields.hasOwnProperty(fieldName) && newFieldNames.indexOf(fieldName) === -1) {
                        delete instance.fields[fieldName];
                    }
                }
            };

            removeObsoleteFields();

            $super.optionsDidChange.call(this, function () {

                fieldOptions.forEach(function (fieldOption) {
                    existingField = instance.fields[fieldOptions.name];

                    if (existingField && existingField.options.type === fieldOption.type) {
                        existingField.setOptions(fieldOption);
                        fieldsCreated++;
                    } else {
                        instance.createField(fieldOption, function (node) {
                            fieldNodes[fieldOption.name] = node;
                            fieldsCreated++;
                            if (fieldsCreated == fieldsToCreate) allFieldsCreated();
                        });
                    }

                });
            });

        },

        contextDidChange: function (next) {
            var instance = this;
            async.forEach(instance.fields, function (field, cb) {
                field.setContext(instance.context, cb);
            }, next);
        },

        serializeOptions: function () {
            var serialized = $super.serializeOptions.call(this);
            delete serialized['fields'];
            serialized.fields = [];
            return serialized
        },

        serializeValue: function () {
            return {}
        },

        reset: function () {
            this.fields.length = 0;
            this.nodes.fields.empty();
        }
    };
});
