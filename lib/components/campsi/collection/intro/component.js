var Campsi = require('campsi');

module.exports = Campsi.extend('component', 'campsi/collection/intro', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.html(instance.context.translate('panels.collection.intro'));
                next();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                next();
            })
        },

        getNodePaths: function () {
            return {};
        },

        optionsDidChange: function (next) {
            next();
        },

        valueDidChange: function (next) {
            next();
        }
    }
});
