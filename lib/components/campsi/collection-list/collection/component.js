var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/collection-list/collection', function ($super) {


    return {
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.name = $('<div class="name drag-handle"></div>');
                instance.nodes.actionsButtonBar = $('<div class="buttons"></div>');
                instance.nodes.adminButton = $('<button class="admin">Admin</button>');
                instance.nodes.designButton = $('<button class="design">Design</button>');
                instance.nodes.removeButton = $('<button class="remove">Remove</button>');
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
                removeButton: '> .buttons > .remove'
            }
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.adminButton.on('click', function () {
                instance.trigger('admin', instance.value._id);
            });
            instance.nodes.designButton.on('click', function () {
                instance.trigger('design', instance.value._id);
            });
            instance.nodes.removeButton.on('click', function () {
                instance.trigger('remove', instance.value._id);
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(this, function () {
                instance.nodes.name.text(instance.value.name);
                next.call(instance);
            });
        }
    }
});