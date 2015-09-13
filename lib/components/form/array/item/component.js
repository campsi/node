var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');


Campsi.extend('component', 'form/array/item', function ($super) {

    return {
        init: function (next) {
            $super.init.call(this, function () {

                this.nodes.dragHandle = $('<div class="drag-handle"></div>');
                this.nodes.container = $('<div class="container"></div>');
                this.nodes.removeButton = $('<button class="remove">&times;</button>');
                this.mountNode.append(this.nodes.dragHandle);
                this.mountNode.append(this.nodes.container);
                this.mountNode.append(this.nodes.removeButton);
                this.mountNode.addClass('draggable');

                if (next) next.call();
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dragHandle': '> .drag-handle',
                'container': '> .container',
                'component': '> .container > .component',
                'removeButton': '> button.remove'
            });
        },

        wakeUp: function (el, next) {

            var instance = this;

            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(this.nodes.component, function (comp) {
                    instance.component = comp;
                    instance.value = comp.value;
                    instance.component.bind('change', function () {
                        instance.triggerChange()
                    });
                    // forward event
                    instance.component.bind('*', function (event) {
                        instance.trigger(event, Array.prototype.slice.call(arguments, 1));
                    });

                    if (next) next.call(this);
                });
            });
        },


        optionsDidChange: function (next) {
            var instance = this;

            instance.nodes.removeButton.toggle(instance.options.removeButton);

            if (instance.component && instance.component.type === instance.options.items.type) {
                instance.component.setOptions(instance.options.items, next);

            } else {

                Campsi.create(instance.options.items.type, instance.options.items, instance.value, function (component) {
                    instance.component = component;
                    instance.nodes.component = component.render();
                    instance.mountNode.attr('data-item-type', instance.options.items.type);
                    //console.info(instance.mountNode);
                    instance.nodes.container.empty().append(instance.nodes.component);

                    instance.component.bind('*', function (event) {
                        instance.trigger(event, Array.prototype.slice.call(arguments, 1));
                    });

                    instance.component.bind('change', function () {
                        instance.triggerChange()
                    });
                    next.call(instance);
                });
            }
        },

        triggerChange: function () {
            this.value = this.component.value;
            this.trigger('change');
        },


        attachEvents: function () {

            var instance = this;

            if (isBrowser) {
                instance.nodes.removeButton.on('click', function () {
                    instance.trigger('remove');
                });
            }

            if (instance.component) {
                instance.component.attachEvents();
            }
        },

        valueDidChange: function (next) {
            if (this.component) {
                return this.component.setValue(this.value, next);
            }
            if (next) next.call();

        },

        serializeOptions: function () {
            return {}
        },

        serializeValue: function () {
            return null
        }
    }
});
