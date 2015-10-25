var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('array', 'campsi/project-list', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                newItem: true,
                items: {
                    type: 'campsi/project-list/project'
                }
            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'newItemForm': '> .items > .newItem'
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            $super.optionsDidChange.call(this, function () {
                instance.nodes.items.append(instance.nodes.newItemForm);
                next();
            });
        },

        serializeOptions: function () {
        }
    }
});