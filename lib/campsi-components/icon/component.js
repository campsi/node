'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('component', 'campsi/icon', function ($super) {
    return {
        getDefaultOptions: function () {
            return {};
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
            });
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
    };
});