'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('array', 'campsi/templates', function () {
    return {
        getDefaultOptions: function () {
            return {
                removeButton: false,
                newItem: false,
                items: { type: 'campsi/templates/item' }
            };
        }
    };
});