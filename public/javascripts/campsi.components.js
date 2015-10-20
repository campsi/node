(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var deepCopy = require('deepcopy');
var equals = require('equals');
var arrayDiff = require('array-diff');
//require('console.table');

module.exports = Campsi.extend('component', 'array', function ($super) {

    var itemKeyCounter = 0;

    return {

        getDefaultOptions: function () {
            return {
                removeButton: true,
                newItem: true,
                newItemLabel: 'create new item'
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
                instance.nodes.newItemForm = $('<form class="newItem"><input type="submit"></form>');

                instance.mountNode.append(instance.nodes.items);
                instance.mountNode.append(instance.nodes.newItemForm);
                next.call(instance);
            });
        },

        wakeUp: function (el, next) {

            var instance = this;
            this.items = [];

            $super.wakeUp.call(instance, el, function () {

                async.forEachOf(instance.nodes.items.find('> .array_item'), function (itemEl, index, cb) {
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

            if (Campsi.drake !== undefined) {
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

            // After that, only newItem events
            if (this.options.newItem !== true) {
                return;
            }

            this.newItem.attachEvents();
            this.nodes.newItemForm.on('submit', this.newItemSubmitHandler.bind(this));
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
            Campsi.create(type, instance.options.items, undefined, function (itemComponent) {
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
                    var $submitBtn = instance.nodes.newItemForm.find('input[type=submit]');
                    instance.newItem = newItemComponent;
                    instance.nodes.newItemForm.append(newItemComponent.render());
                    instance.nodes.newItemForm.append($submitBtn);
                    $submitBtn.attr('value', instance.options.newItemLabel);
                    instance.applyOptionsToItems(next);
                });
            } else {
                instance.applyOptionsToItems(next);
            }
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
                    Campsi.create('array/item', instance.options, instance.value[operation.newIndex], function (itemComponent) {
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

},{"array-diff":undefined,"async":undefined,"campsi":undefined,"cheerio-or-jquery":undefined,"deepcopy":undefined,"equals":undefined}],2:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('component', 'array/item', function ($super) {

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

            if (instance.component && instance.component.type === instance.options.items.type) {
                instance.component.setOptions(instance.options.items, function () {
                    next.call(instance);
                });
            } else {

                if (typeof instance.options.items === 'undefined') {
                    return next.call(instance);
                }

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

            instance.nodes.removeButton.on('click', function () {
                instance.trigger('remove');
            });

            if (instance.component) {
                instance.component.attachEvents();
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            if (typeof this.component !== 'undefined') {
                return this.component.setValue(this.value, function () {
                    next.call();
                });
            } else {
                next.call();
            }
        },

        serializeOptions: function () {
            return {}
        },

        serializeValue: function () {
            return null
        }
    }
});

},{"campsi":undefined,"cheerio-or-jquery":undefined,"is-browser":undefined}],3:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'checkbox', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.append($('<label><input type="checkbox"/><span></span></label>'));
                next.call(instance);
            });
        },

        attachEvents: function () {
            //console.info("checkbox attach events");
            var instance = this;
            var $checkbox = instance.mountNode.find('input[type=checkbox]');
            $checkbox.on('change', function () {
                instance.value = $checkbox.is(':checked');
                instance.trigger('change');
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(instance, function () {
                instance.mountNode.find('span').text(instance.options.label);
                next.call(instance);
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange(function () {
                instance.mountNode.find('input[type=checkbox]').attr('checked', instance.value);
                next.call(instance);
            });
        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],4:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');
var FileDrop;

if (isBrowser) {
    FileDrop = window.FileDrop;
}

module.exports = Campsi.extend('component', 'file', function ($super) {

    return {

        getFileDropOptions: function () {
            return {
                url: '/api/v1/upload',
                logging: false
            }
        },
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.file = $('<div class="file"></div>');
                instance.nodes.dropzone = $('<div class="file-dropzone"></div>');
                instance.nodes.dropzone.append(instance.nodes.file);
                instance.mountNode.append(instance.nodes.dropzone);
                next();
            });
        },

        attachEvents: function () {
            if (!isBrowser) {
                return;
            }

            var options = this.getFileDropOptions();
            var instance = this;
            if (typeof this.dropzone === 'undefined') {

                this.dropzone = new FileDrop(this.nodes.dropzone[0], this.getFileDropOptions());
                this.dropzone.event('send', function (files) {
                    // FileList might contain multiple items.
                    files.each(function (file) {
                        file.event('done', function (xhr) {
                            instance.setValue(JSON.parse(xhr.response), function () {
                                instance.trigger('change');
                            });
                        });
                        file.sendTo(options.url);
                    })
                });

                this.dropzone.event('iframeDone', function (xhr) {
                    instance.setValue(JSON.parse(xhr.response), function () {
                        instance.trigger('change');
                    });
                })


            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                dropzone: '> .file-dropzone',
                file: '> .file-dropzone > .file'
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(this, function () {
                if (typeof instance.value !== 'undefined') {
                    instance.nodes.file.text(instance.value.uri);
                }
                next();
            });
        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined,"is-browser":undefined}],5:[function(require,module,exports){
var Campsi = require('campsi');

module.exports = Campsi.extend('file', 'file/image', function($super){
   return {
       valueDidChange: function(next){
           var instance = this;

           if (typeof instance.value !== 'undefined') {
               instance.nodes.file.css('background-image', 'url(' + instance.value.uri +')');
           } else {
               instance.nodes.file.css('background-image', '');
           }
           next();
       }
   }
});
},{"campsi":undefined}],6:[function(require,module,exports){
var Campsi = require('campsi');
var async = require('async');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('component', 'form', function ($super) {

    return {

        getDefaultValue: function () {
            return {}
        },

        getDefaultOptions: function () {
            return {fields: []}
        },

        getDesignerFormOptions: function () {

            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'fields',
                label: 'fields',
                type: 'campsi/component-list'
            }]);
            return superOptions;
        },

        init: function (next) {

            this.fields = {};

            $super.init.call(this, function () {
                this.nodes.fields = $('<div class="fields"></div>');
                this.mountNode.append(this.nodes.fields);
                next.call(this);
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            var data;
            var fieldName;

            this.fields = {};

            $super.wakeUp.call(instance, el, function () {
                async.forEach(instance.nodes.fields.find('> .component').toArray(), function (componentEl, cb) {
                    Campsi.wakeUp(componentEl, function (componentInstance) {
                        var fieldExistsInOptions = false;
                        fieldName = componentInstance.options.name;
                        instance.options.fields.forEach(function (field) {
                            if (field.name === fieldName) {
                                fieldExistsInOptions = true;
                            }
                        });

                        instance.fields[fieldName] = componentInstance;
                        if (!fieldExistsInOptions) {
                            instance.options.fields.push(componentInstance.options);
                        }
                        instance.value[fieldName] = componentInstance.value;
                        cb.call(null)
                    });
                }, function () {
                    next.call(instance);
                });

            });
        },

        getFieldValue: function (fieldName) {
            if (this.value && this.value[fieldName]) {
                return this.value[fieldName];
            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'fields': '> .fields'
            });
        },


        eachField: function (fn) {
            if (typeof this.options === 'undefined') {
                this.options = this.getDefaultOptions();
            }
            this.options.fields.forEach(function (fieldOptions) {
                fn.call(this, this.fields[fieldOptions.name], fieldOptions.name);
            }, this)
        },

        attachEvents: function () {
            var instance = this;
            instance.eachField(function (fieldComponent, fieldName) {
                fieldComponent.attachEvents();
                instance.listenToFieldEvent(fieldName);
            });
        },

        listenToFieldEvent: function (fieldName) {
            var instance = this;

            instance.fields[fieldName].bind('change', function () {
                instance.value[fieldName] = this.value;
                instance.trigger('change');
            });
        },

        hasFields: function () {
            return (
                typeof this.fields === 'undefined' ||
                typeof this.options === 'undefined' ||
                this.options.fields.length === 0
            );
        },

        valueDidChange: function (next) {
            if (this.hasFields()) {
                //console.info('form.valueDidChange', 'no fields created or no fields in options');
                return next.call(this);
            }

            var instance = this;

            async.eachSeries(instance.options.fields, function (fieldOptions, cb) {
                var fieldComponent = instance.fields[fieldOptions.name];

                if (typeof fieldComponent !== 'undefined') {
                    fieldComponent.setValue(instance.getFieldValue(fieldOptions.name), cb);
                } else {
                    cb.call();
                }

            }, next);
        },

        createField: function (fieldOptions, callback) {
            var instance = this;

            Campsi.create('form/field', fieldOptions, instance.getFieldValue(fieldOptions.name), function (component) {
                instance.fields[fieldOptions.name] = component;
                if (isBrowser) {
                    instance.listenToFieldEvent(fieldOptions.name);
                    instance.fields[fieldOptions.name].attachEvents();
                }
                callback.call(instance, component.render());
            });
        },

        optionsDidChange: function (next) {

            var instance = this;
            var fieldOptions = this.options.fields;
            var fieldNodes = [];
            var fieldsToCreate = fieldOptions.length;
            var fieldsCreated = 0;
            var existingField;


            if (fieldsToCreate == 0) {
                instance.nodes.fields.empty();
                return next.call(this);
            }

            var allFieldsCreated = function () {
                instance.nodes.fields.empty();
                fieldOptions.forEach(function (fieldOption) {
                    instance.nodes.fields.append(fieldNodes[fieldOption.name]);
                });
                return next.call(this);
            };

            var removeObsoleteFields = function () {
                var fieldName;
                var newFieldNames = fieldOptions.map(function (fieldOption) {
                    return fieldOption.name
                });
                for (fieldName in instance.fields) {
                    if (instance.fields.hasOwnProperty(fieldName) && newFieldNames.indexOf(fieldName) === -1) {
                        delete instance.fields[fieldName];
                    }
                }
            };

            removeObsoleteFields();

            $super.optionsDidChange.call(this, function () {

                fieldOptions.forEach(function (fieldOption) {
                    existingField = instance.fields[fieldOptions.name];

                    if (existingField && existingField.options.type === fieldOption.type) {
                        existingField.setOptions(fieldOption);
                        fieldsCreated++;
                    } else {
                        instance.createField(fieldOption, function (node) {
                            fieldNodes[fieldOption.name] = node;
                            fieldsCreated++;
                            if (fieldsCreated == fieldsToCreate) allFieldsCreated();
                        });
                    }

                });
            });

        },

        serializeOptions: function () {
            var serialized = $super.serializeOptions.call(this);
            delete serialized['fields'];
            serialized.fields = [];
            return serialized
        },

        serializeValue: function () {
            return {}
        }
    };
});

},{"async":undefined,"campsi":undefined,"cheerio-or-jquery":undefined,"extend":undefined,"is-browser":undefined}],7:[function(require,module,exports){
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
},{"campsi":undefined,"cheerio-or-jquery":undefined,"deepcopy":undefined}],8:[function(require,module,exports){
var Campsi = require('campsi');
var handlebars = require('handlebars');

module.exports = Campsi.extend('component', 'handlebars', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                template: ''
            }
        },

        getDefaultValue: function () {
            return {}
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.templates = [];
                next();
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                if (instance.options.template) {
                    instance.template = handlebars.compile(instance.options.template);
                }
                next();
            });
        },

        renderTemplate: function () {
            this.mountNode.empty().html(this.template(this.value));
        },

        valueDidChange: function (next) {
            this.renderTemplate();
            next();
        },

        optionsDidChange: function (next) {
            if (typeof this.options.template === 'undefined') {
                next();
            }

            this.templates = this.templates || {};

            if (typeof this.templates[this.options.template] === 'undefined') {
                this.templates[this.options.template] = handlebars.compile(this.options.template);
            }

            this.template = this.templates[this.options.template];
            this.renderTemplate();
            next();
        }

    }
});

},{"campsi":undefined,"handlebars":undefined}],9:[function(require,module,exports){
var Campsi = require('campsi');

require('./form/field/component');
require('./form/component');
require('./array/item/component');
require('./array/component');
require('./checkbox/component');
require('./text/component');
require('./text/area/component');
require('./text/code/component');
require('./file/component');
require('./file/image/component');
require('./handlebars/component');
require('./select/dropdown/component');


console.info("core components finished loading", Campsi.getLoadedComponents());

if (window.onComponentsReady) {
    window.onComponentsReady();
}
},{"./array/component":1,"./array/item/component":2,"./checkbox/component":3,"./file/component":4,"./file/image/component":5,"./form/component":6,"./form/field/component":7,"./handlebars/component":8,"./select/dropdown/component":10,"./text/area/component":11,"./text/code/component":12,"./text/component":13,"campsi":undefined}],10:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'select/dropdown', function ($super) {
    return {

        getDefaultOptions: function () {
            return {
                options: []
            }
        },
        getTagName: function () {
            return 'select';
        },

        attachEvents: function () {
            var instance = this;
            this.mountNode.on('change', function () {
                instance.value = instance.mountNode.val();
                instance.trigger('change');
            });
        },

        optionsDidChange: function (next) {
            this.mountNode.empty();
            this.options.options.forEach(function (opt) {
                var $opt = this.createOption(opt.value, opt.label);
                this.mountNode.append($opt);
            }, this);
            next();
        },

        createOption: function (value, label) {
            var $option = $('<option>');
            $option.attr('value', value);
            $option.text(label);
            return $option;
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next();
        }

    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],11:[function(require,module,exports){
var Campsi = require('campsi');

module.exports = Campsi.extend('text', 'text/area', function(){
    return {
        getTagName: function(){
            return 'textarea';
        }
    }
});
},{"campsi":undefined}],12:[function(require,module,exports){
var Campsi = require('campsi');

module.exports = Campsi.extend('component', 'text/code', function ($super) {

    return {


        getDefaultValue: function () {
            return ''
        },

        wakeUp: function (el, next) {
            $super.wakeUp.call(this, el, function () {
                this.createEditor();
                next();
            })
        },

        attachEvents: function () {
            var instance = this;
            if (this.createEditor()) {
                this.editor.getSession().on('change', function (e) {
                    instance.value = instance.editor.getValue();
                    instance.trigger('change');
                });
            }
        },

        createEditor: function () {
            if (typeof ace === 'undefined') {
                return false;
            }
            if (typeof this.editor !== 'undefined') {
                return true;
            }

            this.editor = ace.edit(this.mountNode[0]);
            this.editor.$blockScrolling = Infinity;
            this.editor.setValue(this.value || this.getDefaultValue());

            if (this.options.mode) {
                this.editor.getSession().setMode(this.options.mode);
            }
            return true;
        },

        valueDidChange: function (next) {
            if (this.createEditor()) {
                this.editor.setValue(this.value);
                return next();
            }
            next();
        }
    }
});
},{"campsi":undefined}],13:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('component', 'text', function ($super) {
    return {

        getDefaultValue: function () {
            return ''
        },

        getTagName: function () {
            return 'input'
        },

        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'text');
                next.call(this);
            });
        },


        focus: function () {
            this.mountNode.focus();
        },

        attachEvents: function () {
            var instance = this;

            this.mountNode.on('change', function (event) {
                instance.value = $(this).val();
                instance.trigger('change', instance.value);
            });
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next.call(this);
        },

        optionsDidChange: function (next) {
            if (this.options.placeholder) {
                this.mountNode.attr('placeholder', this.options.placeholder);
            }
            this.mountNode.attr('disabled', (this.options.disabled));
            next();
        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined,"is-browser":undefined}]},{},[9]);
