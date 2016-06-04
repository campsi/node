'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var async = require('async');
var deepCopy = require('deepcopy');
var isBrowser = require('is-browser');
var insertAt = require('../array/insert-at');

module.exports = Campsi.extend('component', 'blocks', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        getDefaultValue: function () {
            return []
        },

        getDesignerFormOptions: function () {
            return {
                fields: [{
                    type: 'array',
                    name: 'components',
                    label: 'components',
                    additionalClasses: ['designer-blocks-components'],
                    items: {
                        type: 'form',
                        additionalClasses: ['designer-blocks-block'],
                        fields: [{
                            name: 'role',
                            type: 'text',
                            placeholder: 'role'
                        }, {
                            name: 'component',
                            type: 'campsi/component-chooser',
                            label: 'component'
                        }]
                    }
                }]
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.blocks = $('<div class="blocks dropzone dragzone"></div>');
                instance.nodes.components = $('<div class="components"></div>');
                instance.blocks = [];
                instance.mountNode.append(instance.nodes.blocks);
                instance.mountNode.append(instance.nodes.components);
                next();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            instance.blocks = [];
            $super.wakeUp.call(instance, el, context, function () {
                var blocks = instance.nodes.blocks.find('.blocks_block').toArray();
                async.forEachOf(blocks, function eachBlock(el, blockIndex, eachBlockCb) {
                    Campsi.wakeUp(el, context, function (comp) {
                        instance.blocks[blockIndex] = comp;
                        eachBlockCb();
                    });
                }, next);
            });
        },

        attachEvents: function () {
            var instance = this;
            instance.blocks.forEach(function (block) {
                block.attachEvents();
                instance.listenToBlockEvents(block);
            });

            instance.nodes.components.on('click', 'button', function () {
                var nextValue = deepCopy(instance.value);
                nextValue.push({role: $(this).data('role')});
                instance.setValue(nextValue);
            });

            if (typeof Campsi.drake !== 'undefined') {
                Campsi.drake.on('drop', function (el, target) {
                    if (target === instance.nodes.blocks.get(0)) {
                        if (el.classList.contains('blocks_block')) {
                            instance.reorderValueFromNodes();
                        }
                    }
                });
            }
        },

        listenToBlockEvents: function (block) {
            var instance = this;

            block.bind('change', function () {
                var blockIndex = block.mountNode.index();
                var nextValue = deepCopy(instance.value);
                nextValue[blockIndex] = block.value;
                instance.setValue(nextValue);
            });

            block.bind('remove', function () {
                block.mountNode.remove();
                instance.reorderValueFromNodes();
            });
        },

        reorderValueFromNodes: function () {
            var instance = this;
            var newValue = [];
            var j = 0;
            var l = this.blocks.length;
            instance.nodes.blocks.find('> .blocks_block').each(function (i, el) {
                for (j = 0; j < l; j++) {
                    if (instance.blocks[j].mountNode[0] === el) {
                        instance.blocks[j].index = i;
                        newValue.push(instance.blocks[j].value);
                    }
                }
            });
            instance.blocks.sort(function (a, b) {
                return a.index - b.index;
            });
            instance.valueHistory.push(deepCopy(instance.value));
            instance.value = newValue;
            instance.trigger('change');
        },

        getNodePaths: function () {
            return {
                components: '.components',
                blocks: '.blocks'
            };
        },

        optionsDidChange: function (next) {
            var instance = this;
            instance.nodes.components.empty();
            instance.options.components.forEach(function (component) {
                var $btn = $('<button></button>');
                $btn.append($('<img>')
                    .addClass('icon')
                    .attr('src', '/components/' + component.component.type + '/icon.png'));
                $btn.append($('<span>').text(component.role));
                $btn.attr('data-role', component.role);
                instance.nodes.components.append($btn);
            });
            next();
        },

        createBlockAt: function (value, index, cb) {
            var instance = this;

            Campsi.create('blocks/block', {
                context: instance.context,
                value: value,
                options: instance.getBlockOptionsByRole(value.role)
            }, function (comp) {
                if (isBrowser) {
                    comp.attachEvents();
                    instance.listenToBlockEvents(comp);
                }
                instance.blocks[index] = comp;
                cb();
            });
        },

        getBlockOptionsByRole: function (role) {
            var options = {};
            this.options.components.forEach(function (comp) {
                if (comp.role === role) {
                    options = comp;
                }
            });
            return options;
        },

        valueDidChange: function (next) {
            var instance = this;
            async.forEachOf(instance.value, function blockIteration(blockValue, index, eachBlockCb) {
                var currentBlockAtIndex = instance.blocks[index];
                if (currentBlockAtIndex && currentBlockAtIndex.value.role === blockValue.role) {
                    currentBlockAtIndex.mountNode.addClass('keep');
                    currentBlockAtIndex.setValue(blockValue, eachBlockCb);
                } else {
                    instance.createBlockAt(blockValue, index, eachBlockCb);
                }
            }, function allBlocksCb() {
                instance.mountNode.find('> .blocks_block:not(.keep)').remove();
                instance.blocks.forEach(function (block, blockIndex) {
                    if (!block.mountNode.hasClass('keep')) {
                        insertAt(instance.nodes.blocks, block.render(), blockIndex);
                    }
                });
                instance.nodes.blocks.find('.blocks_block').removeClass('keep');
                next();
            });

        }
    }
});