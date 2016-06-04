'use strict';

var Campsi = require('campsi-core');
var deepCopy = require('deepcopy');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'blocks/block', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.addClass('draggable');
                instance.nodes.role = $('<span class="role drag-handle">');
                instance.nodes.remove = $('<span class="remove">&times;</span>');
                instance.mountNode.append(instance.nodes.role);
                instance.mountNode.append(instance.nodes.remove);
                next();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('> .component'), context, function(comp){
                    instance.component = comp;
                    next();
                });
            })
        },

        getNodePaths: function(){
            return {
                role: '> .role',
                remove: '> .remove'
            }
        },

        attachEvents: function(){
            var instance = this;
            instance.component.attachEvents();
            instance.component.bind('*', function (event) {
                if (event.name === 'change') {
                    var newValue = deepCopy(instance.value);
                    newValue.data = instance.component.value;
                    return instance.setValue(newValue);
                }
                instance.forward(event);
            });

            instance.mountNode.on('click', '> .remove', function(){
                instance.trigger('remove');
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            Campsi.create(instance.options.component.type, {options: instance.options.component, context: instance.context}, function(comp){
                instance.component = comp;
                instance.mountNode.append(comp.render());
                instance.nodes.role.text(instance.options.role);
                next();
            });

        },

        valueDidChange: function (next) {
            var instance = this;
            if(instance.component){
                instance.component.setValue(instance.value.data, next);
            } else {
                next();
            }
        }
    }
});