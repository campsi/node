var Campsi = require('campsi-core');

module.exports = Campsi.extend('campsi/sdk', 'campsi/sdk/php', function () {

    return {

        getDefaultOptions: function () {
            return {
                name: 'PHP',
                title: 'Campsi PHP SDK',
                intro: '<p><i>coming soon</i></p>',
                steps: []
            };
        },

        valueDidChange: function (next) {
            next();
        }
    }
});