var Campsi = require('campsi');

Campsi.extend('form/array', 'campsi/user-list', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                removeButton: false,
                newItem: false,
                items: {
                    type: 'campsi/user-list/user'
                }
            }
        }
    }
});