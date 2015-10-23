var Campsi = require('campsi');

module.exports = Campsi.extend('component', 'hash', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                valueComponent: 'text'
            }
        },

        getDefaultValue: function () {
            return {}
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                next();
            });
        },

        valueDidChange: function (next) {
            this.mountNode.empty();
        },

        createProperty: function (property, cb) {

        }
    }

});