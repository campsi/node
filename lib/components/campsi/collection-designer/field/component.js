var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var deepCopy = require('deepcopy');

module.exports = Campsi.extend('component', 'campsi/collection-designer/field', function ($super) {

    return {

        componentType: undefined,

        component: undefined,

        componentOptionsForm: undefined,

        fieldComponentOptions: undefined,

        init: function (next) {

            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.header = $(
                    '<header class="drag-handle">' +
                    '<span class="drag-handle"><i class="fa fa-bars"></i></span>' +
                    '<span class="type"></span>' +
                    '<span class="identifier"></span>' +
                    '<span class="spacer"></span>' +
                    '<button class="advanced"><i class="fa fa-wrench"></i></button>' +
                    '<button class="remove-field"><i class="fa fa-times"></i></button>' +
                    '</header>'
                );

                Campsi.get('form/field', function (FormField) {
                    var dummy = new FormField();
                    instance.fieldComponentOptions = dummy.getDesignerFormOptions();
                    instance.createForm(next);
                });

                //instance.mountNode.addClass('closed');
            });
        },

        createForm: function (next) {
            var instance = this;
            Campsi.create('form', {context: instance.context}, function (form) {
                instance.componentOptionsForm = form;
                instance.nodes.componentOptionsForm = instance.componentOptionsForm.render();

                instance.mountNode.append(instance.nodes.header);
                instance.mountNode.append(instance.nodes.componentOptionsForm);

                next.call();
            });
        },

        getNodePaths: function () {
            return {
                header: '> header',
                componentOptionsForm: '> .component.form'
            }
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.componentOptionsForm, context, function (component) {
                    instance.componentOptionsForm = component;
                    instance.componentType = instance.value.type;
                    next.call();
                });
            });
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.header.find('button.remove-field').on('click', function () {
                instance.trigger('remove');
            });

            instance.nodes.header.find('button.advanced').on('click', function () {
                instance.trigger('editAdvancedOptions', instance);
            });

            instance.componentOptionsForm.attachEvents();
            instance.componentOptionsForm.bind('change', function () {

                var newValue = deepCopy(this.value);
                newValue.type = instance.componentType;

                instance.setValue(newValue, function () {
                    // because type property is not available in the componentOptiosnForm,
                    // we need to set it here
                    instance.value.type = instance.componentType;
                    instance.nodes.header.find('.identifier').text(instance.getIdentifier());
                });
            });

            instance.componentOptionsForm.bind('editAdvancedOptions', function (field) {
                instance.trigger('editAdvancedOptions', field);
            });
        },

        getIdentifier: function () {
            return this.value.name
        },

        valueDidChange: function (next) {

            var instance = this;

            if (typeof instance.value === 'undefined') {
                return next.call(instance);
            }

            if (instance.value.type === instance.componentType) {
                instance.componentOptionsForm.setValue(instance.value, function () {
                    next.call(instance);
                });
            } else {

                instance.componentType = instance.value.type;

                instance.nodes.header.find('.type').text(instance.componentType);
                if(typeof instance.fieldComponentOptions === 'undefined'){
                    console.warn("collection-designer/field fieldComponentOptions is undefined", instance);
                    return next();
                }

                Campsi.get(instance.value.type, function (Component) {

                    var comp = new Component();
                    var options = comp.getDesignerFormOptions();

                    options.fields = instance.fieldComponentOptions.fields.concat(options.fields);

                    instance.componentOptionsForm.setOptions(options, function () {
                        instance.componentOptionsForm.setValue(instance.value, function () {
                            instance.componentOptionsForm.setContext(instance.context, function () {
                                instance.nodes.header.find('.identifier').text(instance.getIdentifier());
                                next();
                            })
                        });
                    });
                });
            }
        }
    }

});