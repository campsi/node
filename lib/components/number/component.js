var Campsi = require('campsi');

module.exports = Campsi.extend('text', 'number', function ($super) {
    return {
        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'number');
                this.mountNode.addClass('text');
                next();
            });
        }
    }
});