var Campsi = require('campsi-core');

module.exports = Campsi.extend('campsi/sdk', 'campsi/sdk/intro', function () {

    return {

        getDefaultOptions: function () {
            return {
                name: this.context.translate('sdk.intro.name'),
                title: this.context.translate('sdk.intro.title'),
                steps: []
            };
        },

        valueDidChange: function (next) {
            next();
        }
    }
});