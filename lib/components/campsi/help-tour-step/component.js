var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/help-tour-step', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.counter = $('<span class="counter">');
                instance.nodes.closeBtn = $('<button class="close"><i class="fa fa-times fa-2x"></i></button>');
                instance.nodes.message = $('<div class="message">');

                instance.mountNode.append(instance.nodes.counter);
                instance.mountNode.append(instance.nodes.closeBtn);
                instance.mountNode.append(instance.nodes.message);

                next();
            });
        },

        getNodePaths: function () {
            return {
                counter: '> .counter',
                closeBtn: '> button.close',
                message: '> .message'
            }
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.closeBtn.on('click', function () {
                instance.disableStep();
            });
        },

        disableStep: function () {
            this.mountNode.fadeOut();
        },

        valueDidChange: function (next) {
            this.nodes.counter.text(String(this.value.counter));
            this.nodes.message.html(this.value.message);
            next();
        }
    }
});