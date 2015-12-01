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

        newItemSubmitHandler: function(event){
            this.trigger('create-collection', this.newItem.value);
            event.preventDefault();
            return false;
        }
    }
});