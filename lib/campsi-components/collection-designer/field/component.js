'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var slug = require('slug');
module.exports = Campsi.extend('component', 'campsi/collection-designer/field', function ($super) {
    return {
        componentType: undefined,
        component: undefined,
        componentOptionsForm: undefined,
        fieldComponentOptions: undefined,
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.header = $('<header class="drag-handle">' + '<span class="drag-handle"></span>' + '<span class="type"></span>' + '<input class="identifier"></input>' + '<span class="spacer"></span>' + '<button class="advanced"><i class="fa fa-wrench"></i></button>' + '<button class="remove-field"><i class="fa fa-times"></i></button>' + '</header>');
                instance.createFormFieldOptions(function () {
                    instance.createForm(next);
                });    //instance.mountNode.addClass('closed');
            });
        },
        createFormFieldOptions: function (cb) {
            var instance = this;
            Campsi.get('form/field', function (FormField) {
                var dummy = new FormField();
                dummy.context = instance.context;
                instance.fieldComponentOptions = dummy.getDesignerFormOptions();
                cb();
            });
        },
        createForm: function (next) {
            var instance = this;
            Campsi.create('form', { context: instance.context }, function (form) {
                instance.componentOptionsForm = form;
                instance.nodes.componentOptionsForm = instance.componentOptionsForm.render();
                instance.nodes.componentOptionsForm.addClass('component-options-form');
                instance.mountNode.append(instance.nodes.header);
                instance.mountNode.append(instance.nodes.componentOptionsForm);
                next.call();
            });
        },
        getNodePaths: function () {
            return {
                header: '> header',
                componentOptionsForm: '> .component.form'
            };
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.componentOptionsForm, context, function (component) {
                    instance.componentOptionsForm = component;
                    instance.componentType = instance.value.type;
                    instance.createFormFieldOptions(next);
                });
            });
        },
        attachEvents: function () {
            var instance = this;
            instance.nodes.header.find('button.remove-field').on('click', function () {
                instance.trigger('remove');
            });
            instance.nodes.header.find('button.advanced').on('click', function () {
                instance.trigger({
                    name: 'editProperties',
                    field: instance.value.name
                });
            });
            instance.nodes.header.on('change', 'input.identifier', function () {
                var newValue = extend({}, instance.value, this.value);
                newValue.name = $(this).val();
                instance.setValue(newValue);
            });
            instance.componentOptionsForm.attachEvents();
            instance.componentOptionsForm.bind('editProperties', function (event) {
                event.field = instance.value.name + '.' + event.field;
                instance.trigger(event);
            });
            instance.componentOptionsForm.bind('change', function () {
                var newValue = extend({}, instance.value, this.value);
                newValue.type = instance.componentType;
                instance.setValue(newValue, function () {
                    // because type property is not available in the componentOptiosnForm,
                    // we need to set it here
                    instance.value.type = instance.componentType;
                    instance.nodes.header.find('.identifier').val(instance.getIdentifier());
                });
            });
            instance.componentOptionsForm.fields.label.component.bind('blur', function () {
                if ((typeof instance.value.name === 'undefined' || instance.value.name === '') && typeof instance.value.label === 'string') {
                    instance.setValue(extend({}, instance.value, { name: slug(instance.value.label) }));
                }
            });
        },
        getIdentifier: function () {
            return this.value.name;
        },
        valueDidChange: function (next) {
            var instance = this;
            if (typeof instance.value === 'undefined') {
                return next.call(instance);
            }
            instance.mountNode.toggleClass('noname', !instance.value.name && !instance.value.label);
            instance.mountNode.attr('data-field-name', instance.value.name);
            if (instance.value.type === instance.componentType) {
                instance.componentOptionsForm.setValue(instance.value, function () {
                    next.call(instance);
                });
            } else {
                instance.componentType = instance.value.type;
                instance.nodes.header.find('.type').empty().append($('<img>').attr('src', '/components/' + instance.componentType + '/icon.png'));
                instance.mountNode.attr('data-comp-type', instance.componentType);
                if (typeof instance.fieldComponentOptions === 'undefined') {
                    console.warn('collection-designer/field fieldComponentOptions is undefined', instance);
                }
                Campsi.get(instance.value.type, function (Component) {
                    var options = Component.prototype.getDesignerFormOptions(instance.context);
                    options.fields = instance.fieldComponentOptions.fields.concat(options.fields);
                    instance.componentOptionsForm.setOptions(options, function () {
                        instance.componentOptionsForm.setValue(instance.value, function () {
                            instance.componentOptionsForm.setContext(instance.context, function () {
                                instance.nodes.header.find('.identifier').val(instance.getIdentifier());
                                next();
                            });
                        });
                    });
                });
            }
        }
    };
});