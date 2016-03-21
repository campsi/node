var Campsi = require('campsi-core');

module.exports = Campsi.extend('campsi/sdk', 'campsi/sdk/http', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                name: 'HTTP',
                title: 'Accessing the API',
                steps: [{
                    title: 'Grab the entries',
                    blocks: [{type: "url"}]
                },{
                    title: 'Customize the URL',
                    optional: true,
                    blocks: [
                        '<h3>Filtering</h3><p>You can filter the entries by appending parameters to the query string</p>',
                        {type: 'url', value: '?data.category=sport'},
                        '<h3>Sorting</h3><p>Change the sort order by appending <code>sort={property}</code></p>',
                        {type: 'url', value: '?sort=data.date'},
                        '<h3>Paging</h3><p>Change the sort order by appending <code>skip={number of entries to skip}</code></p>',
                        {type: 'url', value: '?skip=20&limit=20'}
                    ]
                }]
            };
        },

        valueDidChange: function (next) {
            this.steps[0].blocks[0].setValue(this.context.apiURL('entries', {}, false));
            this.steps[1].blocks[1].setValue(this.context.apiURL('entries', {}, false) + '?data.title=hello');
            this.steps[1].blocks[3].setValue(this.context.apiURL('entries', {}, false) + '?sort=data.title');
            this.steps[1].blocks[5].setValue(this.context.apiURL('entries', {}, false) + '?skip=20&limit=20');
            next();
        }
    }
});