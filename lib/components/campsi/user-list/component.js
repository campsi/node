var Campsi = require('campsi');

module.exports = Campsi.extend('array', 'campsi/user-list', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                removeButton: false,
                newItem: true,
                items: {
                    type: 'campsi/user-list/user'
                }
            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'newItemForm': '> .items > .newItem'
            });
        },


        optionsDidChange: function(next){
            var instance = this;
            $super.optionsDidChange.call(this, function(){
                instance.nodes.items.append(instance.nodes.newItemForm);
                next();
            });
        }
    }
});