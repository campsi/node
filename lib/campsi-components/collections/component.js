'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'campsi/collections', function () {

    return {

        valueDidChange: function (next) {
            var instance = this;
            var list = [];

            this.value.forEach(function (collection) {
                var item = $('<div>');
                item.append($('<a class="name">')
                    .text(collection.name)
                    .attr('href', instance.context.applicationURL('entriesAndDrafts', {collection: collection}))
                );
                list.push(item);
            });


            this.mountNode.empty().append(list);
            next();
        }
    }
});