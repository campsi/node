var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-designer/components', function ($super) {

    return {
        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.groups = $('<div class="groups"></div>');
                instance.mountNode.append(instance.nodes.groups);
                next();
            });
        },

        getNodePaths: function () {
            return {
                groups: '.groups'
            }
        },

        sortValueByCategory: function () {
            var categoryHash = {};
            this.value.forEach(function (comp) {
                if (typeof categoryHash[comp.category] === 'undefined') {
                    categoryHash[comp.category] = [];
                }
                categoryHash[comp.category].push(comp);
            }, this);

            return categoryHash;
        },

        createComponent: function (component, $category) {
            var $component = $('<div class="component draggable icon">' +
                               '        <div class="icon drag-handle"></div>' +
                               '        <span class="name"></span>' +
                               '</div>');

            $component.find('.icon').append('<img src="/components/' + component.name + '/icon.png">');
            $component.find('span').text(component.name);
            $component.attr('data-component-type', component.name);

            $category.find('.components').append($component);
        },

        createCategory: function (category, components) {
            var $category = $('<div class="group">' +
                              '     <h3></h3>' +
                              '     <div class="components dragzone"></div>' +
                              '</div>');

            $category.find('h3').text(category);

            components.forEach(function (component) {
                this.createComponent(component, $category);
            }, this);

            $category.find('.components').append('<div class="clear"></div>');

            this.nodes.groups.append($category);
        },

        valueDidChange: function (next) {

            var sorted = this.sortValueByCategory();
            var category;
            this.nodes.groups.empty();

            for (category in sorted) {
                if (sorted.hasOwnProperty(category)) {
                    this.createCategory(category, sorted[category]);
                }
            }
            next();
        },

        load: function (next) {
            var instance = this;
            $.getJSON('/api/v1/components', function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },

        serializeOptions: function () {
        }
    }

});