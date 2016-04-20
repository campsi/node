'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('campsi/sdk', 'campsi/sdk/http', function () {
    return {
        getDefaultOptions: function () {
            return {
                name: this.context.translate('sdk.http.name'),
                title: this.context.translate('sdk.http.title'),
                steps: [
                    {
                        title: this.context.translate('sdk.http.getURL.title'),
                        blocks: [{ type: 'url' }]
                    },
                    {
                        title: this.context.translate('sdk.http.customizeURL.title'),
                        optional: true,
                        blocks: [
                            this.context.translate('sdk.http.customizeURL.filtering'),
                            {
                                type: 'url',
                                value: '?data.category=sport'
                            },
                            this.context.translate('sdk.http.customizeURL.sorting'),
                            {
                                type: 'url',
                                value: '?sort=data.date'
                            },
                            this.context.translate('sdk.http.customizeURL.paging'),
                            {
                                type: 'url',
                                value: '?skip=20&limit=20'
                            }
                        ]
                    }
                ]
            };
        },
        valueDidChange: function (next) {
            this.steps[0].blocks[0].setValue(this.context.apiURL('entries', {}, false));
            this.steps[1].blocks[1].setValue(this.context.apiURL('entries', {}, false) + '?data.title=hello');
            this.steps[1].blocks[3].setValue(this.context.apiURL('entries', {}, false) + '?sort=data.title');
            this.steps[1].blocks[5].setValue(this.context.apiURL('entries', {}, false) + '?skip=20&limit=20');
            next();
        }
    };
});