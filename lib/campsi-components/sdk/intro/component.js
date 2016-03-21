var Campsi = require('campsi-core');

module.exports = Campsi.extend('campsi/sdk', 'campsi/sdk/intro', function () {

    return {

        getDefaultOptions: function () {
            return {
                name: 'Let\'s get started',
                title: 'How does it work?',
                steps: []
            };
        },

        valueDidChange: function (next) {
            next();
        }
    }
});