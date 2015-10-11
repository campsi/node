var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-list/collection', function ($super) {


    return {
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.name = $('<div class="name drag-handle"></div>');
                instance.nodes.actionsButtonBar = $('<div class="buttons"></div>');
                instance.nodes.editButton = $('<a class="edit btn">Edit</a>');
                instance.nodes.adminButton = $('<a class="admin btn">Admin</a>');
                instance.nodes.designButton = $('<a class="design btn">Design</a>');
                instance.nodes.removeButton = $('<button class="remove">Remove</button>');
                instance.nodes.actionsButtonBar.append(instance.nodes.editButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.adminButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.designButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.removeButton);
                instance.mountNode.append(instance.nodes.name);
                instance.mountNode.append(instance.nodes.actionsButtonBar);
                next.call(instance);
            });
        },

        getNodePaths: function () {
            return {
                name: '> .name',
                actionsButtonBar: '> .buttons',
                adminButton: '> .buttons > .admin',
                designButton: '> .buttons > .design',
                removeButton: '> .buttons > .remove',
                editButton: '> .buttons > .edit'
            }
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.removeButton.on('click', function () {
                instance.trigger('remove');
            });
        },

        valueDidChange: function (next) {
            var instance = this;

            var projectUrl;

            $super.valueDidChange.call(this, function () {
                instance.nodes.name.text(instance.value.name);
                var collectionUrl = Campsi.url(instance.value.__project, instance.value);
                instance.nodes.editButton.attr('href', collectionUrl);
                instance.mountNode.attr('href', collectionUrl);
                instance.nodes.adminButton.attr('href', collectionUrl + '/admin');
                instance.nodes.designButton.attr('href', collectionUrl + '/design');
                next.call(instance);
            });
        }
    }
});