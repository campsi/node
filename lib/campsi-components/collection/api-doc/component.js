var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');

module.exports = Campsi.extend('component', 'campsi/collection/api-doc', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                sdks: ['campsi/sdk/js', 'campsi/sdk/http', 'campsi/sdk/php']
            };
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.header = $('<header>');
                instance.nodes.container = $('<div class="container">');
                instance.mountNode.append(instance.nodes.header);
                instance.mountNode.append(instance.nodes.container);
                next();
            });
        },

        attachEvents: function () {
            var sdks = this.nodes.container.find('> .campsi_sdk');
            this.sdks.forEach(function (sdk) {
                sdk.attachEvents();
            });

            this.nodes.header.on('click', 'a', function (e) {
                $(this).siblings().removeClass('active');
                $(this).addClass('active');
                sdks.removeClass('active').eq($(this).index()).addClass('active');
                e.preventDefault();
            });

        },
        wakeUp: function (el, context, next) {
            var instance = this;
            instance.sdks = [];
            $super.wakeUp.call(instance, el, context, function () {
                instance.nodes.container.find('> .component').each(function (i, sdkEl) {
                    Campsi.wakeUp(sdkEl, context, function (sdkComp) {
                        instance.sdks.push(sdkComp);
                    });
                });
                next();
            })
        },

        getNodePaths: function () {
            return {
                header: '> header',
                container: '> .container'
            }
        },

        optionsDidChange: function (next) {
            var instance = this;
            instance.sdks = [];

            async.forEach(instance.options.sdks, function (sdk, cb) {
                Campsi.create(sdk, {context: instance.context}, function (comp) {
                    instance.sdks.push(comp);
                    instance.nodes.container.append(comp.render());
                    instance.nodes.header.append($('<a href="#">').text(comp.options.name));
                    cb();
                });
            }, function () {
                instance.sdks[0].mountNode.addClass('active');
                instance.nodes.header.find('a').eq(0).addClass('active');
                next();
            });

        },

        valueDidChange: function (next) {
            var instance = this;
            async.forEach(instance.sdks, function (sdk, cb) {
                sdk.setValue(instance.value, cb);
            }, next);
        }
    }
});