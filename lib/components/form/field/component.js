var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'form/field', function ($super) {

    return {

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'label': '> div.label',
                'control': '> div.control',
                'errors': '> div.errors',
                'help': '> div.help'
            });
        },

        init: function (next) {

            $super.init.call(this, function () {

                this.nodes.label = $('<div class="label">');
                this.nodes.control = $('<div class="control">');
                this.nodes.errors = $('<div class="errors">');
                this.nodes.help = $('<div class="help">');

                this.mountNode
                    .append(this.nodes.label)
                    .append(this.nodes.control)
                    .append(this.nodes.errors)
                    .append(this.nodes.help);

                if (next) next.call(this);
            });
        },

        focus: function () {


        },

        optionsDidChange: function (next) {
            this.nodes.label.text(this.options.label);
            if(next) next.call(this);
        }
    }
});