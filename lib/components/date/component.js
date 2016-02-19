var Campsi = require('campsi');

Campsi.extend('text', 'date',function($super){
    return {
        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'date');
                this.mountNode.addClass('text');
                next();
            });
        }
    }
});