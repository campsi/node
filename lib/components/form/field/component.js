var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var deepCopy = require('deepcopy');

module.exports = Campsi.extend('component', 'form/field', function ($super) {


    return {

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('> .control > .component'), context, function (comp) {
                    instance.component = comp;
                    instance.component.parent = instance;
                    instance.value = instance.component.value;
                    next.call();
                });
            });
        },

        renderValue: function(){
            return $('<div>')
                .addClass('form-field')
                .attr('data-name', this.options.name)
                .append($('<div class="label">').text(this.options.label))
                .append($('<div class="value">').append(this.component.renderValue()));
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
                placeholder: 'field label (field name will be generated)',
                additionalClasses: ['form-field-label']
            }/*, {
                name: 'name',
                label: 'field name',
                type: 'text',
                additionalClasses: ['form-field-name']
            }*/]);

            return superOptions;
        },

        getAdvancedFormOptions: function () {
            var superOptions = $super.getAdvancedFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'name',
                label: 'field name',
                type: 'text'
            }, {
                name: 'required',
                label: 'required',
                type: 'checkbox'
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

        // TODO RENAME THAT SHIT
        update: function () {
            var instance = this;
            if (this.options.visible) {
                var visible = this.options.visible;
                var expr = visible.replace(new RegExp('\{([a-zA-Z\./_-]+)\}', 'g'), function (group, capture) {
                    var parts = capture.split('/');
                    var obj = instance;
                    while (parts.length) {
                        var part = parts.shift();
                        if (part === '..') {
                            obj = obj['parent'];
                        } else {
                            obj = obj[part];
                        }
                        if (typeof obj === 'undefined') {
                            parts.length = 0;
                        }
                    }
                    return (typeof obj !== 'undefined') ? '"' + obj.toString() + '"' : 'null';
                });

                this.mountNode.toggle(eval(expr));
            }

            if (typeof this.component.updateFields === 'function') {
                this.component.updateFields();
            }
        },

        optionsDidChange: function (next) {

            var instance = this;

            if (instance.options.label) {
                instance.nodes.label.text(instance.options.label);
            } else {
                instance.nodes.label.text('').css('display', 'none');
            }

            if (instance.options.help) {
                instance.nodes.help.text(instance.options.help);
            }

            if (instance.options.visible) {
                instance.mountNode.addClass('hidden')
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
                //delete componentOptions['name'];
                //delete componentOptions['label'];
                delete componentOptions['additionalClasses'];

                Campsi.create(instance.options.type, {
                    options: componentOptions,
                    value: instance.value,
                    context: instance.context
                }, function (component) {
                    instance.component = component;
                    instance.component.parent = instance;
                    instance.nodes.component = instance.component.render();
                    instance.nodes.control.append(instance.nodes.component);
                    next.call();
                });
            }
        },


        contextDidChange: function (next) {
            this.component.setContext(this.context, next);
        },

        attachEvents: function () {
            var instance = this;

            instance.component.bind('*', function (event) {
                if (event === 'change') {
                    return instance.setValue(instance.component.value)
                }
                return instance.forward(event, arguments);
            });

            instance.component.attachEvents();

        },

        processValue: function (value, callback) {
            var errors = [];

            if (this.options.required === true && this.isEmpty(value)) {
                errors.push('required');
            }

            callback(errors, value);
        },

        errorsDidChange: function (cb) {
            var instance = this;
            var errors = this.errors.concat(this.component.errors);
            //console.info(this.mountNode[0], errors);
            instance.nodes.errors.empty();
            errors.forEach(function (err) {
                instance.nodes.errors.append($('<p>').text(err));
            });
            cb();
        },

        valueDidChange: function (next) {
            var instance = this;

            if (typeof instance.component !== 'undefined') {
                return instance.component.setValue(instance.value, next, false);
            }

            next();
        },

        serializeOptions: function () {
            return {
                label: this.options.label,
                name: this.options.name,
                visible: this.options.visible,
                required: this.options.required
            }
        },

        serializeValue: function () {
        }
    }
});