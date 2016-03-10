var Campsi = require('campsi-core');

module.exports = Campsi.extend('component', 'link', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        getTagName: function(){
            return 'a'
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
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
            this.mountNode.html(this.options.label);
            next();
        },

        valueDidChange: function (next) {
            this.mountNode.attr('href', this.value);
            next();
        }
    }
});