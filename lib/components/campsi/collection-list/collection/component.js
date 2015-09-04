var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/collection-list/collection', function ($super) {


    return {
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.name = $('<div class="name"></div>');
                instance.mountNode.append(instance.nodes.name);
                next.call(instance);
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