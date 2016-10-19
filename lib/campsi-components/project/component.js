'use strict';
//todo rename en project
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'campsi/project', function ($super) {

    return {

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.project = $('<div class="project">');
                instance.nodes.collections = $('<div class="collections">');
                instance.nodes.forms = $('<div class="forms">');
                instance.mountNode.append(instance.nodes.project);
                instance.mountNode.append($('<h3>').text('Collections'));
                instance.mountNode.append(instance.nodes.collections);
                instance.mountNode.append($('<h3>').text('Forms'));
                instance.mountNode.append(instance.nodes.forms);
                next();
            });
        },

        getNodePaths: function () {
            return {
                'project': '.project',
                'collections': '.collections',
                'forms': '.forms'
            }
        },

        optionsDidChange: function (next) {
            console.info(this.options);
            var instance = this;
            instance.mountNode.find('a.name')
                .removeClass('selected')
                .filter('[data-id=' + instance.options.currentCollectionId + ']')
                .addClass('selected');

            next();
        },


        valueDidChange: function (next) {
            var instance = this;
            var list = [];

            if (this.value && this.value.collections) {

                this.nodes.project.empty();
                if (this.value.icon) {
                    this.nodes.project.append($('<img>').attr('src', this.value.icon.src + '?w=600'));
                }
                this.nodes.project.append($('<a target="_blank">→</a>').attr('href', this.value.url));

                this.value.collections.forEach(function (collection) {
                    var item = $('<div>');
                    var active = (instance.options.currentCollectionId == collection._id.toString());

                    item.append($('<a class="name">')
                        .text(collection.name)
                        .attr('href', instance.context.applicationURL('collection', {collection: collection}))
                        .attr('data-id', collection._id)
                        .toggleClass('selected', active)
                    );
                    list.push(item);
                });
            }

            this.nodes.collections.empty().append(list);
            next();
        }
    }
});