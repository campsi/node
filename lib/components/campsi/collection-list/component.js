var Campsi = require('campsi');

module.exports = Campsi.extend('array', 'campsi/collection-list', function ($super) {
    return {

        getDefaultOptions: function () {
            return {
                newItem: true,
                newItemType: 'campsi/collection-list/wizard',
                newItemLabel: this.context.translate('panels.project.newCollectionBtn'),
                items: {
                    type: 'campsi/collection-list/collection',
                    removeButton: false
                }
            }
        },

        attachItemEvents: function (item) {

            var instance = this;

            $super.attachItemEvents.call(this, item);

            item.bind('admin', function (id) {
                instance.trigger('admin', id);
            });

            item.bind('design', function (id) {
                instance.trigger('design', id);
            });
        },

        newItemSubmitHandler: function(event){
            this.trigger('create-collection', this.newItem.value);
            event.preventDefault();
            return false;
        }
    }
});