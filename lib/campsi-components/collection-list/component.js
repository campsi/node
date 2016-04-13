var Campsi = require('campsi-core');
var page = require('page');
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

        newItemSubmitHandler: function (event) {
            event.preventDefault();
            var instance = this;
            var templateId = this.newItem.value;
            if (templateId !== 'empty') {
                var url = instance.context.apiURL('collections');
                $.post(url + '?template=' + templateId, function (collection) {
                    page(instance.context.applicationURL('collection', {collection: collection}));
                });
            } else {
                page(this.context.applicationURL('newCollection'));
            }
        }
    }
});