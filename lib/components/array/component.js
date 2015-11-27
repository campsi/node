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

            instance.setValue(newValue);
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

            if (typeof this.newItem === 'undefined') {
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
            var newValue = deepCopy(this.value);
            newValue.splice(index, 0, newItem);
            this.setValue(newValue, cb);
        },

        removeItemAt: function (index, cb) {
            var newValue = deepCopy(this.value);
            newValue.splice(index, 1);
            this.setValue(newValue, cb);
        },

        itemChange: function (index, itemValue) {
            if (this.value[index] !== itemValue) {
                var newValue = deepCopy(this.value);
                newValue[index] = itemValue;
                this.setValue(newValue);
            }
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

        contextDidChange: function (next) {
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
                next();
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            var itemNode;
            var previousValue = instance.getPreviousValue() || [];
            var diff = arrayDiff(previousValue, instance.value);

            //console.info('diff', diff);

            diff = diff.filter(function (change) {
                return change.newIndex > -1 && change.oldIndex > change.newIndex;
            });

            diff.sort(function (a, b) {
                return a.oldIndex - b.oldIndex;
            });

            //console.info('value', instance.value);
            //console.info('items', instance.items.map(function(item){return item.value}));
            //console.info('diff', diff);

            diff.forEach(function (change) {
                var swapItem = instance.items[change.newIndex];
                instance.items[change.newIndex] = instance.items[change.oldIndex];
                instance.items[change.oldIndex] = swapItem;
            });
            //console.info('result', instance.items.map(function(item){return item.value}));

            // let's return early if the reordering was enough
            if(equals(instance.value, instance.items.map(function(item){return item.value}))){
                return next();
            }

            // we could use a parallel foreach, but it means more complex dom appending
            async.forEachOfSeries(instance.value, function (itemValue, itemIndex, iterationCallback) {
                if (instance.items.length <= itemIndex) {
                    Campsi.create('array/item', {
                        options: instance.options,
                        value: itemValue,
                        context: instance.context
                    }, function (itemComponent) {
                        itemComponent.index = itemIndex;
                        instance.attachItemEvents(itemComponent);
                        instance.itemWasCreated(itemComponent);
                        instance.items.push(itemComponent);
                        itemNode = itemComponent.render();
                        itemNode.addClass('keep');
                        instance.nodes.items.append(itemNode);
                        iterationCallback();
                    });
                } else {
                    instance.items[itemIndex].setValue(itemValue, function () {
                        itemNode = instance.items[itemIndex].render();
                        itemNode.addClass('keep');
                        instance.nodes.items.append(instance.items[itemIndex].render());
                        instance.items[itemIndex].index = itemIndex;
                        iterationCallback();
                    });
                }
            }, function () {
                instance.nodes.items.children('.array_item:not(.keep)').remove();
                instance.nodes.items.children('.keep').removeClass('keep');
                next();
            });
        },

        itemWasCreated: function (itemComponent) {

        },
        serializeValue: function () {
            return [];
        }
    }

});
