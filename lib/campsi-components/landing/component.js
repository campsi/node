var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var fs = require('fs');
var path = require('path');
var isBrowser = require('is-browser');


module.exports = Campsi.extend('component', 'campsi/landing', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                if (!isBrowser) {
                    fs.readFile(path.join(__dirname, './assets/landing.html'), 'utf-8', function (err, html) {
                        instance.mountNode.append(html);
                    });
                } else {
                    // todo find le path
                }
                next();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                instance.loadHtml();
                next();
            })
        },

        loadHtml: function () {
            var instance = this;
            //$.getJSON('/api/v1/projects/campsi/collections/landing-pages/entries', function(entries){
            //     instance.mountNode.html(entries[0].data.content);
            //});
        }
    }
});