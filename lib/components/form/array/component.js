var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var deepCopy = require('deepcopy');
var equals = require('equals');

Campsi.extend('form/field', 'form/array', function ($super) {

    var arrayDiff = function (prev, next) {

        var diff = [];

        var indexOfEquals = function (array, value) {
            var index = -1;
            array.forEach(function (el, i) {
                if (equals(el, value)) {
                    index = i;
                }
            });

            return index;
        };


        var foundIndexes = [];

        prev.forEach(function (itemPrev, indexPrev) {
            var indexNext = indexOfEquals(next, itemPrev);
            if (indexNext >= 0) {
                foundIndexes.push(indexNext);
            }
            diff.push({
                oldIndex: indexPrev,
                newIndex: indexNext
            });

        });

        next.forEach(function (itemNext, indexNext) {
            if (foundIndexes.indexOf(indexNext) === -1) {
                diff.push({
                    oldIndex: -1,
                    newIndex: indexNext
                })
            }
        });

        return diff;
    };

    return {

        getDefaultOptions: function () {
            return {
                removeButton: true,
                newItem: true
            }
        },

        /** Init and wakeup */

        init: function (next) {

            this.items = [];
            $super.init.call(this, function () {
                this.nodes.items = $('<div class="items dropzone dragzone"></div>');
                this.nodes.newItemForm = $('<form class="newItem"></form>');
                this.nodes.control.append(this.nodes.items);
                this.nodes.control.append(this.nodes.newItemForm);
                if (next) next.call(this);
            });
        },

        wakeUp: function (el, next) {

            var instance = this;
            this.items = [];

            $super.wakeUp.call(instance, el, function () {
                async.forEachOf(instance.nodes.items.find('> .form_array_item'), function (itemEl, index, cb) {
                    Campsi.wakeUp(itemEl, function (itemComponent) {
                        itemComponent.index = index;
                        instance.items.push(itemComponent);
                        instance.value[index] = itemComponent.value;
                        cb.call(null);
                    })
                }, function () {
                    var newItemEl = instance.nodes.newItemForm.find('> .component');
                    if (newItemEl.length > 0) {
                        Campsi.wakeUp(newItemEl, function (newItem) {
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
                'items': '> .control > .items',
                'newItemForm': '> .control > .newItem'
            });
        },


        /** Events */

        attachEvents: function () {
            var instance = this;
            this.items.forEach(function (item) {
                instance.attachItemEvents(item);
            });


            if (Campsi.drake !== undefined) {
                Campsi.drake.on('drop', function (el, target, source) {
                    if (target === instance.nodes.items[0]) {
                        if (el.classList.contains('form_array_item')){
                            console.info("I have to code the reorder")
                        } else {
                            instance.foreignDrop(el, source);
                        }
                    }
                });
            }

            // After that, only newItem events
            if (this.options.newItem !== true) {
                return;
            }

            this.newItem.attachEvents();

            this.nodes.newItemForm.on('submit', function (event) {
                instance.createItemAt(instance.newItem.value, instance.items.length);
                instance.newItem.resetValue();
                event.preventDefault();
                return false;
            });


        },

        foreignDrop: function(el, source){

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
        createItemAt: function (newItem, index, cb) {
            var instance = this;
            var newValue = deepCopy(this.value);
            newValue.splice(index, 0, newItem);
            this.setValue(newValue, function () {
                instance.trigger('change');
                if(cb) cb.call(instance);
            });
        },

        removeItemAt: function (index, cb) {
            var instance = this;
            var newValue = deepCopy(this.value);
            newValue.splice(index, 1);
            this.setValue(newValue, function () {
                instance.trigger('change');
                if(cb) cb.call(instance);
            });
        },


        itemChange: function (index, value) {
            this.value[index] = value;
            this.trigger('change');
        },

        createNewItemForm: function (cb) {
            var instance = this;
            Campsi.create(instance.options.items.type, instance.options.items, undefined, function (itemComponent) {
                cb.call(instance, itemComponent);
            });
        },

        optionsDidChange: function (next) {

            var instance = this;
            $super.optionsDidChange.call(this, function () {

                // if the options have changed, the newItemForm might be invalid
                if (typeof instance.newItem !== 'undefined') {
                    instance.nodes.newItemForm.empty();
                    delete instance['newItem'];
                }

                if (instance.options.newItem) {
                    instance.createNewItemForm(function (newItemComponent) {
                        instance.newItem = newItemComponent;
                        instance.nodes.newItemForm.append(newItemComponent.render());
                        next.call();
                    });
                } else {
                    next.call();
                }
            });
        },

        valueDidChange: function (next) {

            var instance = this;
            var previousValue = instance.getPreviousValue() || [];
            var diff = arrayDiff(previousValue, instance.value);

            async.forEach(diff, function (operation, cb) {
                var itemValue = instance.value[operation.newIndex];

                if (operation.newIndex === -1) {
                    instance.nodes.items.find('> .form_array_item').eq(operation.oldIndex).remove();
                    delete instance.items[operation.oldIndex];
                    cb.call();
                } else if (operation.oldIndex === -1) {
                    Campsi.create('form/array/item', instance.options, itemValue, function (itemComponent) {
                        itemComponent.index = operation.newIndex;
                        instance.attachItemEvents(itemComponent);
                        instance.items.push(itemComponent);
                        cb.call();
                    });

                } else if (operation.newIndex != operation.oldIndex) {
                    instance.items[operation.oldIndex].index = operation.newIndex;
                    cb.call();
                } else {
                    cb.call();
                }
            }, function () {

                // remove every deleted item
                instance.items = instance.items.filter(function (item) {
                    return (typeof item !== 'undefined')
                });
                // sort by index, obviously
                instance.items.sort(function (a, b) {
                    return a.index - b.index;
                });

                // append to the items node ? maybe we should do empty before ?
                instance.items.forEach(function (itemComponent) {
                    instance.nodes.items.append(itemComponent.render());
                });
                if (next) next.call();
            });

        },

        serializeValue: function () {
            return [];
        }
    }

});
