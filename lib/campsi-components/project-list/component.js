'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('array', 'campsi/project-list', function () {
    return {
        getDefaultOptions: function () {
            return {
                newItem: true,
                items: {
                    type: 'campsi/project-list/project'
                }
            };
        },
        serializeOptions: function () {
        },
        serializeValue: function () {
        }
    };
});