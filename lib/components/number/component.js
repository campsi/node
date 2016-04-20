'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('text', 'number', function ($super) {
    return {
        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'number');
                this.mountNode.addClass('text');
                next();
            });
        },
        getAdvancedFormOptions: function () {
            return {
                fields: [
                    {
                        type: 'number',
                        name: 'gt',
                        label: 'greater than',
                        additionalClasses: ['horizontal']
                    },
                    {
                        type: 'number',
                        name: 'lt',
                        label: 'lower than',
                        additionalClasses: ['horizontal']
                    },
                    {
                        type: 'number',
                        name: 'modulo',
                        label: 'modulo',
                        additionalClasses: ['horizontal']
                    }
                ]
            };
        }
    };
});