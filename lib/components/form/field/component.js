var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var deepCopy = require('deepcopy');

module.exports = Campsi.extend('component', 'form/field', function ($super) {


    return {

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .control > .component'), function (comp) {
                    instance.component = comp;
                    instance.value = instance.component.value;
                    next.call();
                });
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'label': '> div.label',
                'control': '> div.control',
                'errors': '> div.errors',
                'help': '> div.help',
                'component': '> div.control > div.component'
            });
        },

        getDesignerFormOptions: function () {

            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'label',
                label: 'label',
                type: 'text',
                additionalClasses: ['form-field-label']
            }, {
                name: 'name',
                label: 'field name',
                type: 'text',
                additionalClasses: ['form-field-name']
            }]);

            return superOptions;

        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {

                instance.nodes.label = $('<div class="label">');
                instance.nodes.control = $('<div class="control">');
                instance.nodes.errors = $('<div class="errors">');
                instance.nodes.help = $('<div class="help">');

                instance.mountNode
                    .append(instance.nodes.label)
                    .append(instance.nodes.control)
                    .append(instance.nodes.errors)
                    .append(instance.nodes.help);

                next.call(instance);
            });
        },

        optionsDidChange: function (next) {

            var instance = this;

            if (instance.options.label) {
                instance.nodes.label.text(instance.options.label);
            } else {
                instance.nodes.label.text('').css('display', 'none');
            }

            if(instance.options.help){
                instance.nodes.help.text(instance.options.help);
            }

            instance.mountNode.attr('data-name', instance.options.name);
            instance.mountNode.attr('data-comp-type', instance.options.type);

            if (typeof instance.component !== 'undefined' && instance.component.type === instance.options.type) {
                instance.component.setOptions(instance.options, function () {
                    next.call();
                });
            } else {
                if (instance.options.type === instance.type) {
                    return next.call();
                }

                var componentOptions = deepCopy(instance.options);
                delete componentOptions['name'];
                //delete componentOptions['label'];
                delete componentOptions['additionalClasses'];

                Campsi.create(instance.options.type, componentOptions, instance.value, function (component) {
                    instance.component = component;
                    instance.nodes.component = instance.component.render();
                    instance.nodes.control.append(instance.nodes.component);
                    next.call();
                });
            }
        },

        attachEvents: function () {
            var instance = this;

            instance.component.bind('*', function (event) {
                if (event === 'change') {
                    instance.value = instance.component.value;
                    instance.trigger('change');
                } else {
                    instance.trigger(event, Array.prototype.slice.call(arguments, 1));
                }
            });

            instance.component.attachEvents();

        },

        valueDidChange: function (next) {
            var instance = this;
            var nextCalled = false;


            if (typeof instance.component !== 'undefined') {
                instance.component.setValue(instance.value, function () {
                    next.call(instance);
                    nextCalled = true;
                });
            } else {
                nextCalled = true;
                next.call(this);
            }
        },

        serializeOptions: function () {
            return {
                label: this.options.label,
                name: this.options.name
            }
        },

        serializeValue: function () {
        }
    }
});