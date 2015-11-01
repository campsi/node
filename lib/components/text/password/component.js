var Campsi = require('campsi');
module.exports = Campsi.extend('text', 'text/password', function ($super) {
    return {
        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'password');
                this.mountNode.addClass('text');
                next();
            });
        }
    }
});