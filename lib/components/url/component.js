var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'url', function ($super) {

    return {

        getDefaultValue: function () {
            return ''
        },

        getTagName: function(){
            return 'span'
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.input = $('<input type="text" disabled>');
                instance.nodes.goButton = $('<a target="_blank" class="btn"><i class="fa fa-external-link"></i></a>');
                instance.mountNode.append(instance.nodes.input);
                instance.mountNode.append(instance.nodes.goButton);
                next();
            });
        },

        getNodePaths: function () {
            return {input: 'input', goButton: '.btn'};
        },

        valueDidChange: function (next) {
            this.nodes.input.val(this.value);
            this.nodes.goButton.attr('href', this.value);
            next();
        }
    }
});