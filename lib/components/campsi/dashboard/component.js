var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'campsi/dashboard', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.mountNode.append($('<h1>Dashboard</h1>'));
                instance.createGreeting(instance.context.user);
                next();
            });
        },

        createGreeting: function(user){
            var $p = $('<p>');
            $p.append(this.context.translate('dashboard.greeting'));
            $p.append(' ');
            $p.append(JSON.stringify(user));
            this.mountNode.append($p);
        }
    }
});