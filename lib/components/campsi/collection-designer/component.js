var Campsi = require('campsi');
var extend = require('extend');

Campsi.extend('form', 'campsi/collection-designer', function ($super) {

    return {
        getDefaultOptions: function () {
            return extend({}, $super.getDefaultOptions(), {
                fields: [
                    {
                        name: 'name',
                        type: 'form/text',
                        additionalClasses: ['invisible', 'title']
                    },
                    {
                        name: 'fields',
                        type: 'form/array',
                        label: 'Fields',
                        newItem: false,
                        removeButton: false,
                        items: {
                            type: 'campsi/collection-designer/field'
                        }
                    }
                ]
            });
        }
    }
});