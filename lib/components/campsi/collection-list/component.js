var Campsi = require('campsi');

module.exports = Campsi.extend('array', 'campsi/collection-list', function () {
    return {

        getDefaultOptions: function () {
            return {
                newItem: true,
                newItemType: 'campsi/collection-list/wizard',
                newItemLabel: this.context.translate('panels.project.newCollectionBtn'),
                placeholder: this.context.translate('panels.project.noCollectionYet'),
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