var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
Campsi.extend('component', 'campsi/collection-designer/field', function ($super) {

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
                        '<span class="drag-handle">&equiv;</span>' +
                        '<span class="type"></span>' +
                        '<span class="spacer"></span>' +
                        '<button class="advanced">&#65533;</button>' +
                        '<button class="remove-field">&times;</button>' +
                    '</header>'
                );

                Campsi.get('form/field', function (FormField) {
                    var dummy = new FormField();
                    instance.fieldComponentOptions = dummy.getDesignerFormOptions();
                    instance.createForm(next);
                });
            });
        },

        createForm: function (next) {
            var instance = this;
            Campsi.create('form', undefined, undefined, function (form) {
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

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, function () {
                Campsi.wakeUp(instance.nodes.componentOptionsForm, function (component) {
                    instance.componentOptionsForm = component;
                    next.call();
                });
            });
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.header.find('button.remove-field').on('click', function(){
                instance.trigger('remove');
            });
            instance.componentOptionsForm.attachEvents();
            instance.componentOptionsForm.bind('change', function () {
                instance.value = this.value;
                instance.trigger('change');
            });
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

                Campsi.get(instance.value.type, function (Component) {

                    var comp = new Component();
                    var options = comp.getDesignerFormOptions();

                    options.fields = instance.fieldComponentOptions.fields.concat(options.fields);

                    instance.componentOptionsForm.setOptions(options, function () {
                        instance.componentOptionsForm.setValue(instance.value, function () {
                            next.call(instance);
                        });
                    });
                });
            }
        }
    }

});