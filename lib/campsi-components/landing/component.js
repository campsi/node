var Campsi = require('campsi-core');
var fs = require('fs');
var path = require('path');
var isBrowser = require('is-browser');


module.exports = Campsi.extend('component', 'campsi/landing', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                console.info("INIT LANDING");
                if (!isBrowser) {
                    fs.readFile(path.join(__dirname, './assets/landing.html'), 'utf-8', function (err, html) {
                        instance.mountNode.html(html);
                        next();
                    });
                }

            });
        }
    }
});