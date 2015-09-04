var Campsi = require('campsi');
var async = require('async');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

Campsi.extend('form/field', 'form', function ($super) {

    return {

        defaultValue: {},

        init: function (next) {

            this.fields = {};

            $super.init.call(this, function () {
                this.nodes.fields = $('<div class="fields"></div>');
                this.nodes.control.append(this.nodes.fields);
                if (next) next.call(this);
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            var data;
            var fieldName;

            this.fields = {};

            $super.wakeUp.call(instance, el, function () {
                async.forEach(instance.nodes.fields.find('> .component'), function (componentEl, cb) {

                    var data = $(componentEl).data();

                    Campsi.wakeUp(componentEl, function(componentInstance){
                        fieldName = componentInstance.options.name;
                        instance.fields[fieldName] = componentInstance;
                        instance.options.fields[fieldName] = componentInstance.options;
                        instance.value[fieldName] = componentInstance.value;
                        cb.call(null)
                    });
                }, function () {
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
                'fields': '> .control > .fields'
            });
        },


        eachField: function (fn) {
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
            });
        },

        valueDidChange: function (next) {

            if (typeof this.fields === 'undefined' || typeof this.options.fields === 'undefined') {
                console.info('form.valueDidChange', 'no fields created or no fields in options');
                next.call(this);
            }

            var instance = this;

            var cnt = 0;
            var fieldValueHasBeenSet = function () {
                cnt++;
                if (cnt == instance.options.fields.length) {
                    if(next) next.call(instance);
                }
            };

            this.eachField(function (fieldComponent, fieldName) {
                if (fieldComponent) {
                    fieldComponent.setValue(this.getFieldValue(fieldName), fieldValueHasBeenSet);
                } else {
                    console.info("form.valueDidChange", "no component set form field ", fieldName);
                }
            });

        },

        createField: function (fieldOptions, callback) {
            var instance = this;

            Campsi.create(fieldOptions.type, fieldOptions, instance.getFieldValue(fieldOptions.name), function (component) {
                instance.fields[fieldOptions.name] = component;

                if (isBrowser) {
                    instance.listenToFieldEvent(fieldOptions.name);
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

            var allFieldsCreated = function () {
                instance.nodes.fields.empty();
                fieldOptions.forEach(function (fieldOption) {
                    instance.nodes.fields.append(fieldNodes[fieldOption.name]);
                });
                return next.call(this);
            };

            var removeObsoleteFields = function () {
                var fieldName;
                var newFieldNames = fieldOptions.map(function(fieldOption){ return fieldOption.name });
                for (fieldName in instance.fields) {
                    if(instance.fields.hasOwnProperty(fieldName) && newFieldNames.indexOf(fieldName) === -1){
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
                        });
                    }
                    if (fieldsCreated == fieldsToCreate) allFieldsCreated();
                });
            });

        },

        serializeOptions: function(){
            var serialized = $super.serializeOptions.call(this);
            delete serialized['fields'];
            serialized.fields = [];
            return serialized
        },

        serializeValue: function(){
            return {}
        }
    };
});
