var Campsi = require('campsi-core');
var extend = require('extend');
var deepcopy = require('deepcopy');
module.exports = Campsi.extend('component', 'campsi/collection/field-properties', function ($super) {
    return {

        getDefaultAdvancedFormFields: function () {
            return [{
                name: 'name',
                label: this.context.translate('panels.designer.advancedForm.fields.name'),
                type: 'text',
                additionalClasses: []
            }, {
                name: 'required',
                label: this.context.translate('panels.designer.advancedForm.fields.required'),
                type: 'checkbox',
                additionalClasses: []
            }, {
                name: 'hide',
                defaultValue: true,
                label: this.context.translate('panels.designer.advancedForm.fields.hide'),
                checkboxText: this.context.translate('panels.designer.advancedForm.fields.hide.checkboxText'),
                type: 'checkbox',
                additionalClasses: []
            }, {
                name: 'help',
                type: 'text/area',
                label: this.context.translate('panels.designer.advancedForm.fields.help'),
                additionalClasses: []
            }, {
                name: 'additionalClasses',
                type: 'checkbox/group',
                label: this.context.translate('panels.designer.advancedForm.fields.additionalClasses'),
                additionalClasses: [],
                options: [
                    {label: 'horizontal', value: 'horizontal'},
                    {label: 'important', value: 'important'}
                ]
            }]
        },

        getDefaultValue: function(){

        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('form', {context: this.context}, function (form) {
                    instance.form = form;
                    instance.mountNode.append(form.render());
                    next();
                });
            });
        },

        wakeUp: function (el, context, cb) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('> .form'), context, function (form) {
                    instance.form = form;
                    if (instance.value.collection && instance.value.fieldName) {
                        instance.fields = deepcopy(instance.value.collection.fields);
                        instance.getField();
                    }
                    cb();
                });
            });
        },

        attachEvents: function () {
            var instance = this;
            instance.form.attachEvents();
            instance.form.bind('change', function () {
                extend(instance.field, instance.form.value);
                instance.value = {fieldName: instance.value.fieldName, collection: {fields: instance.fields}};
                instance.trigger('change');
            });
        },

        getField: function () {

            var instance = this;

            if (!instance.value.fieldName) {
                delete instance.field;
                return;
            }

            var path = instance.value.fieldName.split('.');
            var ref = instance.fields;
            var i = 0;
            var j;
            for (; i < path.length; i++) {
                if (ref.type === 'form') {
                    ref = ref.fields;
                }

                if (ref.type === 'array') {
                    ref = ref.items.fields;
                }

                if (typeof ref.length !== 'undefined') {
                    for (j = 0; j < ref.length; j++) {
                        if (ref[j].name === path[i]) {
                            ref = ref[j]
                        }
                    }
                }
            }
            instance.field = ref;
        },

        valueDidChange: function (next) {
            var instance = this;
            var propertiesFields = this.getDefaultAdvancedFormFields();
            if (instance.value.fieldName && instance.value.collection) {
                instance.fields = deepcopy(instance.value.collection.fields);
                instance.getField();
                Campsi.create(instance.field.type, {context: instance.context}, function (dummyComponent) {
                    var componentAdvancedFields = dummyComponent.getAdvancedFormOptions();
                    propertiesFields = propertiesFields.concat(componentAdvancedFields.fields);
                    instance.form.setOptions({fields: propertiesFields}, function () {
                        instance.form.setValue(instance.field, next, false)
                    });
                });
            } else {
                next();
            }

        },

        serializeValue: function () {
            if (this.value.fieldName && this.value.collection) {
                return {
                    fieldName: this.value.fieldName,
                    collection: {
                        fields: this.value.collection.fields
                    }
                }
            }

            return {}
        },

        save: function(){
            var collectionPanelComponent = this.context.panels.collection.component;
            var value = extend({}, collectionPanelComponent.value, {fields: this.fields});
            var instance = this;
            collectionPanelComponent.setValue(value, function(){
                instance.trigger('saved');
                collectionPanelComponent.component.save();
            })
        }
    }
});