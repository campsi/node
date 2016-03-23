var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');
var deepCopy = require('deepcopy');
var diff = require('./array-diff');
var insertAt = function (parent, child, index) {
    var size = parent.children().length;
    if (index === 0) {
        return parent.prepend(child);
    }

    if (index > size) {
        return parent.append(child);
    }

    return parent.children().eq(index - 1).after(child);
};
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

        getTemplate: function (options, callback) {
            if (!options.items || !options.items.type) {
                return callback('\n{{#each this}}\n\t{{ arrayItem }}\n{{/each}}\n');
            }

            Campsi.get(options.items.type, function (ItemTypeComponent) {
                ItemTypeComponent.prototype.getTemplate(options.items, function (itemTemplate) {
                    itemTemplate = '\n' + itemTemplate;
                    itemTemplate = itemTemplate.replace(/this/g, 'arrayItem');
                    callback('\n{{#each this}}' + itemTemplate.replace(new RegExp('\n', 'g'), '\n    ') + '\n{{/each}}\n');
                });
            });
        },

        getHtml: function (data, options, callback) {
            var $ul = $('<ul>');
            var items = [];
            Campsi.get(options.items.type, function (ItemTypeComponent) {
                async.forEachOf(data, function renderEachItem(item, index, cb) {
                    ItemTypeComponent.prototype.getHtml(item, options.items, function (html) {
                        var $li = $('<li>');
                        $li.append(html);
                        items[index] = $li;
                        cb();
                    });
                }, function allItemsRendered() {
                    $ul.append(items);
                    callback($ul);
                });
            });
        },

        renderValue: function () {
            var $div = $('<ul>');
            $div.addClass('array');
            $div.attr('data-name', this.options.name);
            $div.append(this.items.map(function (item) {
                return item.renderValue();
            }));

            return $div;
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
                instance.nodes.placeholder = $('<div class="placeholder">');
                instance.mountNode.append(instance.nodes.placeholder);
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
                        instance.items[index] = itemComponent;
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
                'newItemForm': '> .newItem',
                'placeholder': '> .placeholder'
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

            instance.items.sort(function (a, b) {
                return a.index - b.index;
            });

            instance.valueHistory.push(deepCopy(instance.value));
            instance.value = newValue;
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

            if (typeof this.newItem === 'undefined') {
                console.error('newItem was not woken up', this.mountNode[0]);
                return;
            }

            this.newItem.attachEvents();
            this.newItem.bind('submit', function () {
                instance.newItemSubmitHandler();
            });

            this.nodes.newItemForm.find('> form').on('submit', function (event) {
                instance.newItemSubmitHandler(event)
            });
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
            if (event) {
                event.preventDefault();
            }
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
            if (typeof index === 'undefined') {
                return;
            }
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

            if (instance.options.placeholder) {
                instance.nodes.placeholder.html(instance.options.placeholder);
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
                if (err) {
                    console.error(err);
                }
                next();
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            var itemNode;
            var previousValue = instance.getPreviousValue().slice() || [];

            if (instance.value.length === 0) {
                instance.nodes.placeholder.show();
                instance.nodes.items.empty();
                instance.items.length = 0;
                return next();
            } else {
                instance.nodes.placeholder.hide();
            }

            var newItems = new Array(instance.value.length);

            var operations = diff(previousValue, instance.value);

            //console.info(previousValue, instance.value, operations);

            async.forEachSeries(operations, function (operation, iterationCallback) {
                if (operation.type === 'create' || (operation.type === 'keep' && typeof instance.items[operation.index] === 'undefined')) {
                    Campsi.create('array/item', {
                        options: instance.options,
                        value: instance.value[operation.index],
                        context: instance.context
                    }, function (itemComponent) {
                        instance.attachItemEvents(itemComponent);
                        instance.itemWasCreated(itemComponent);
                        newItems[operation.index] = itemComponent;
                        iterationCallback();
                    });
                } else {
                    if (operation.type === 'move') {
                        newItems[operation.next] = instance.items[operation.prev];
                        newItems[operation.next].index = operation.next;
                        iterationCallback();
                    } else if (operation.type === 'replace') {
                        newItems[operation.next] = instance.items[operation.prev];
                        newItems[operation.next].setValue(instance.value[operation.next], iterationCallback, false);
                    } else if (operation.type !== 'remove') {
                        newItems[operation.index] = instance.items[operation.index];
                        iterationCallback();
                    } else {
                        iterationCallback();
                    }
                }
            }, function () {
                instance.items.length = 0;
                instance.items = newItems;

                instance.items.forEach(function (item, index) {
                    item.index = index;
                    itemNode = item.render();
                    itemNode.addClass('keep');
                });

                instance.nodes.items.children('.array_item:not(.keep)').remove();
                instance.nodes.items.children().removeClass('keep');

                instance.items.forEach(function(item, index){
                    itemNode = item.render();
                    if (itemNode.index() !== index) {
                        insertAt(instance.nodes.items, itemNode, index);
                    }
                });
                next();
            });
        },

        itemWasCreated: function (itemComponent) {

        },
        serializeValue: function () {
            return [];
        },

        filter: function (value, properties) {
            var instance = this;

            properties = properties || ['value'];
            instance.items.forEach(function (item) {
                var itemMatch = false;
                properties.forEach(function (prop) {
                    var parts = prop.split('.');
                    var pointer = item;
                    parts.forEach(function (part) {
                        if (typeof pointer === 'object' && typeof pointer[part] !== 'undefined') {
                            pointer = pointer[part];
                        }
                    });

                    var str = JSON.stringify(pointer);
                    if (str.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                        itemMatch = true;
                    }
                });
                item.render().toggle(itemMatch);
            });
        }
    }

});
