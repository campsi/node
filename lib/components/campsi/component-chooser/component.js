var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/component-chooser', function ($super) {

    return {

        init: function (next) {
            var instance = this;

            $super.init.call(instance, function () {
                instance.nodes.dropzone = $('<div class="dropzone dragzone">Drop a component here to define what contains the array</div>');
                instance.mountNode.append(instance.nodes.dropzone);
                next.call(instance);
            });
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dropzone': ' > .dropzone'
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            console.info(instance.value);
            next.call();
        }
    }

});