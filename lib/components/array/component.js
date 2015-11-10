var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var deepCopy = require('deepcopy');
var equals = require('equals');
var arrayDiff = require('array-diff');
//require('console.table');

module.exports = Campsi.extend('component', 'array', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                removeButton: true,
                newItem: true,
                newItemLabel: '+'
            }
        },

        getDefaultValue: function () {
            return [];
        },

        getDesignerFormOptions: function () {
            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'items',
                label: 'items',
                type: 'campsi/component-chooser'
            }]);
            return superOptions;
        },

        /** Init and wakeup */

        init: function (next) {

            var instance = this;
            instance.items = [];
            $super.init.call(instance, function () {
                instance.nodes.items = $('<div class="items dropzone dragzone"></div>');
                instance.nodes.newItemForm = $('<div class="form newItem"><form><input type="submit"></form></div>');

                instance.mountNode.append(instance.nodes.items);
                instance.mountNode.append(instance.nodes.newItemForm);
                next.call(instance);
            });
        },

        wakeUp: function (el, context, next) {

            var instance = this;
            this.items = [];

            $super.wakeUp.call(instance, el, context, function () {
                async.forEachOf(instance.nodes.items.find('> .array_item'), function (itemEl, index, cb) {
                    Campsi.wakeUp(itemEl, context, function (itemComponent) {
                        itemComponent.index = index;
                        instance.items.push(itemComponent);
                        instance.value[index] = itemComponent.value;
                        cb.call(null);
                    })
                }, function () {
                    var newItemEl = instance.nodes.newItemForm.find('> .component');
                    if (newItemEl.length > 0) {
                        Campsi.wakeUp(newItemEl, context, function (newItem) {
                            instance.newItem = newItem;
                            next.call(instance);
                        });
                    } else {
                        next.call(instance);
                    }
                });

            });

        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'items': '> .items',
                'newItemForm': '> .newItem'
            });
        },

        reorderValueFromNodes: function () {

            var instance = this;
            var newValue = [];
            var j = 0;
            var l = this.items.length;

            instance.nodes.items.find('> .array_item').each(function (i, el) {
                for (j = 0; j < l; j++) {
                    if (instance.items[j].mountNode[0] === el) {
                        instance.items[j].index = i;
                        newValue.push(instance.items[j].value);
                    }
                }
            });

            instance.value = newValue;
            //instance.debugIndex('reorder');
            instance.trigger('change');
        },

        /** Events */

        attachEvents: function () {

            var instance = this;

            this.items.forEach(function (item) {
                instance.attachItemEvents(item);
            });

            if (typeof this.eventsAttached !== 'undefined') {
                return;
            }

            if (typeof Campsi.drake !== 'undefined') {
                Campsi.drake.on('drop', function (el, target, source) {
                    if (target === instance.nodes.items[0]) {
                        if (el.classList.contains('array_item')) {
                            instance.reorderValueFromNodes()
                        } else {
                            instance.foreignDrop(el, source);
                        }
                    }
                });
            }

            this.eventsAttached = true;

            // After that, only newItem events
            if (this.options.newItem !== true) {
                return;
            }

            if(typeof this.newItem === 'undefined'){
                console.error('newItem was not woken up', this.mountNode[0]);
                return;
            }

            this.newItem.attachEvents();
            this.nodes.newItemForm.find('> form').on('submit', this.newItemSubmitHandler.bind(this));
        },

        foreignDrop: function (el, source) {
            var $el = $(el);
            var componentType = $el.data('component-type');
            if (componentType) {
                this.createItemAt({type: componentType}, $(el).index(), function () {
                    $el.remove();
                });
            }
        },

        attachItemEvents: function (item) {
            var instance = this;

            item.attachEvents();

            item.bind('remove', function () {
                instance.removeItemAt(item.index);
            });

            item.bind('change', function () {
                instance.itemChange(item.index, item.value);
            });
        },

        newItemSubmitHandler: function (event) {

            this.createItemAt(this.newItem.value, this.items.length);
            this.newItem.resetValue(function () {

            });
            event.preventDefault();
            return false;
        },

        createItemAt: function (newItem, index, cb) {
            var instance = this;
            var newValue = deepCopy(this.value);
            newValue.splice(index, 0, newItem);
            this.setValue(newValue, function () {
                instance.trigger('change');
                if (cb) cb.call(instance);
            });
        },

        removeItemAt: function (index, cb) {
            var instance = this;
            var newValue = deepCopy(this.value);
            newValue.splice(index, 1);
            this.setValue(newValue, function () {
                instance.trigger('change');
                if (cb) cb.call(instance);
            });
        },


        itemChange: function (index, value) {
            this.value[index] = value;
            this.trigger('change');
        },

        createNewItemForm: function (cb) {
            var instance = this;
            var type = instance.options.newItemType || instance.options.items.type;
            Campsi.create(type, {options: instance.options.items, context: instance.context}, function (itemComponent) {
                cb.call(instance, itemComponent);
            });
        },

        optionsDidChange: function (next) {

            var instance = this;

            // if the options have changed, the newItemForm might be invalid
            if (typeof instance.newItem !== 'undefined') {
                instance.nodes.newItemForm.empty();
                delete instance['newItem'];
            }

            if (instance.options.newItem && typeof instance.options.items !== 'undefined') {
                instance.createNewItemForm(function (newItemComponent) {
                    var $submitForm = instance.nodes.newItemForm.find('> form');
                    instance.newItem = newItemComponent;
                    instance.nodes.newItemForm.append(newItemComponent.render());
                    instance.nodes.newItemForm.append($submitForm);
                    instance.nodes.newItemForm.removeClass('hidden');
                    $submitForm.find('input[type=submit]').attr('value', instance.options.newItemLabel);
                    instance.applyOptionsToItems(next);
                });
            } else {
                instance.nodes.newItemForm.addClass('hidden');
                instance.applyOptionsToItems(next);
            }
        },

        contextDidChange: function(next){
            var instance = this;
            async.each(instance.items, function (item, cb) {
                item.setContext(instance.context, cb);
            }, next);
        },

        applyOptionsToItems: function (next) {
            var instance = this;
            async.each(instance.items, function (item, cb) {
                item.setOptions(instance.options, cb);
            }, function (err) {
                next.call();
            });
        },

        debugIndex: function (identifier) {
            console.info(identifier);
            console.table([['itemIndex', 'valueIndex', 'value']].concat(this.items.map(function (a, index) {
                return [index, a.index, a.value.name]
            })));
        },

        valueDidChange: function (next) {

            if (!Array.isArray(this.value)) {
                console.error('array component value must be an array ', this.value, 'given');
                return next();
            }

            var instance = this;
            var previousValue = instance.getPreviousValue() || [];

            var diff = arrayDiff(previousValue, instance.value);

            async.forEach(diff, function (operation, cb) {

                if (operation.newIndex === -1) {

                    var l = instance.items.length;
                    var j = 0;
                    instance.nodes.items.find('> .array_item').eq(operation.oldIndex).each(function (i, el) {
                        el.classList.add('itemToRemove');
                        for (; j < l; j++) {
                            if (instance.items[j].mountNode[0] === el) {
                                instance.items[j].index = -1;
                            }
                        }
                    });
                    cb.call();
                } else if (operation.oldIndex === -1) {
                    Campsi.create('array/item', {
                        options: instance.options,
                        value: instance.value[operation.newIndex],
                        context: instance.context
                    }, function (itemComponent) {
                        itemComponent.index = operation.newIndex;
                        instance.attachItemEvents(itemComponent);
                        instance.itemWasCreated(itemComponent);
                        instance.items.push(itemComponent);
                        cb.call();
                    });
                } else {
                    instance.items[operation.oldIndex].index = operation.newIndex;
                    cb.call();
                }
            }, function () {

                // remove every deleted item
                instance.items = instance.items.filter(function (item) {
                    return (item.index !== -1)
                });

                // sort by index, obviously
                instance.items.sort(function (a, b) {
                    return a.index - b.index;
                });

                //instance.debugIndex('valueDidChange');

                // append to the items node ? maybe we should do empty before ?
                //instance.nodes.items.empty();
                // EDIT: nope, we lose the attached handlers

                instance.items.forEach(function (itemComponent) {
                    instance.nodes.items.append(itemComponent.render());
                });

                instance.nodes.items.find('> .itemToRemove').remove();

                next.call();
            });

        },

        itemWasCreated: function (itemComponent) {

        },
        serializeValue: function () {
            return [];
        }
    }

});
