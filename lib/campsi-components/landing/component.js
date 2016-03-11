var Campsi = require('campsi-core');

module.exports = Campsi.extend('component', 'campsi/landing', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {

                instance.mountNode.append('<header><h1>Let me take care of your content</h1></header>');
                instance.mountNode.append('<section><button class="sign-up">Sign Up</button><button class="login">Log in</button></section>');

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