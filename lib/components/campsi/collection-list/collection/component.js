var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-list/collection', function ($super) {


    return {
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.name = $('<div class="name drag-handle"></div>');
                instance.nodes.actionsButtonBar = $('<div class="buttons"></div>');
                instance.nodes.icon = $('<img class="icon"/>');

                instance.nodes.editButton = $('<a class="edit btn"><i class="fa fa-pencil-square-o"></i><span></span></a>');
                instance.nodes.editButton.find('span').text(instance.context.translate('panels.project.collectionList.editBtn'));

                instance.nodes.adminButton = $('<a class="admin btn"><i class="fa fa-pencil"></i><span></span></a>');
                instance.nodes.adminButton.find('span').text(instance.context.translate('panels.project.collectionList.adminBtn'));

                instance.nodes.designButton = $('<a class="design btn"><i class="fa fa-cogs"></i><span></span></a>');
                instance.nodes.designButton.find('span').text(instance.context.translate('panels.project.collectionList.designBtn'));

                instance.nodes.removeButton = $('<button class="remove"<i class="fa fa-trash-o"><span></span></button>');
                instance.nodes.removeButton.find('span').text(instance.context.translate('panels.project.collectionList.removeBtn'));

                instance.nodes.actionsButtonBar.append(instance.nodes.editButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.adminButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.designButton);

                instance.mountNode.append(instance.nodes.icon);
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
                //removeButton: '> .buttons > .remove',
                editButton: '> .buttons > .edit',
                icon: '> img.icon'
            }
        },

        valueDidChange: function (next) {
            var instance = this;

            $super.valueDidChange.call(this, function () {
                instance.nodes.name.text(instance.value.name);
                var collectionUrl = instance.context.applicationURL('collection', {collection: instance.value});
                instance.nodes.editButton.attr('href', collectionUrl);
                instance.mountNode.attr('href', collectionUrl);
                instance.nodes.adminButton.attr('href', collectionUrl + '/admin');
                instance.nodes.designButton.attr('href', collectionUrl + '/design');
                instance.nodes.adminButton.toggleClass('hidden', !instance.value.hasFields);

                if (instance.value.icon && instance.value.icon.uri) {
                    instance.nodes.icon.attr('src', instance.value.icon.uri + '?w=40');
                } else {
                    instance.nodes.icon.removeAttr('src');
                }
                next.call(instance);
            });
        }
    }
});