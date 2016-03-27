var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'array/item', function ($super) {

    return {
        init: function (next) {
            $super.init.call(this, function () {

                this.nodes.dragHandle = $('<div class="drag-handle"></div>');
                this.nodes.container = $('<div class="container"></div>');
                this.nodes.removeButton = $('<button class="remove"><i class="fa fa-remove"></i></button>');
                this.mountNode.append(this.nodes.dragHandle);
                this.mountNode.append(this.nodes.container);
                this.mountNode.append(this.nodes.removeButton);
                this.mountNode.addClass('draggable');

                if (next) {
                    next.call();
                }
            });
        },

        renderValue: function(){
            return $('<li>').append(this.component.renderValue());
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dragHandle': '> .drag-handle',
                'container': '> .container',
                'component': '> .container > .component',
                'removeButton': '> button.remove'
            });
        },

        wakeUp: function (el, context, next) {

            var instance = this;

            $super.wakeUp.call(this, el, context, function () {
                Campsi.wakeUp(this.nodes.component, context, function (comp) {
                    instance.component = comp;
                    instance.value = comp.value;
                    if (next) {
                        next.call(this);
                    }
                });
            });
        },


        optionsDidChange: function (next) {
            var instance = this;

            if (instance.component && instance.component.type === instance.options.items.type) {
                instance.component.setOptions(instance.options.items, function () {
                    next.call(instance);
                });
            } else {

                if (typeof instance.options.items === 'undefined') {
                    return next.call(instance);
                }

                Campsi.create(instance.options.items.type, {
                    options: instance.options.items,
                    value: instance.value,
                    context: instance.context
                }, function (component) {
                    instance.component = component;
                    instance.nodes.component = component.render();
                    instance.mountNode.attr('data-item-type', instance.options.items.type);
                    instance.nodes.container.empty().append(instance.nodes.component);

                    next.call(instance);
                });
            }
        },


        attachEvents: function () {

            if (typeof this.eventsAttached !== 'undefined') {
                return;
            }

            var instance = this;

            instance.nodes.removeButton.on('click', function () {
                instance.trigger('remove');
            });

            if (instance.component) {
                instance.component.attachEvents();

                instance.component.bind('*', function (event) {
                    if (event.name === 'change') {
                        return instance.setValue(instance.component.value);
                    }
                    instance.forward(event);
                });
            }

            instance.eventsAttached = true;
        },

        valueDidChange: function (next) {
            if (typeof this.component !== 'undefined') {
                return this.component.setValue(this.value, next, false);
            }
            next();
        },

        serializeOptions: new Function(),

        serializeValue: new Function()
    }
});
