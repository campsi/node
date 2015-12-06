//var NRP = require('node-redis-pubsub');
//var nrp = new NRP({
//
//});

var EventBus = function () {
    this.listeners = {};
};

EventBus.prototype.on = function (event, handler) {

    if (typeof this.listeners[event] === 'undefined') {
        this.listeners[event] = [];
    }

    this.listeners[event].push(handler);
};

EventBus.prototype.emit = function (event, data) {
    var eventParts = event.split(':');
    var channel;
    var channelParts;
    var match;
    for (channel in this.listeners) {
        match = true;
        if (this.listeners.hasOwnProperty(channel)) {
            channelParts = channel.split(':');

            channelParts.forEach(function (part, i) {
                if (match === false) {
                    return false;
                }

                if (typeof eventParts[i] === 'undefined') {
                    match = false;
                }

                if (eventParts[i] !== part && part !== '*') {
                    match = false;
                }
            });

            if (match) {
                this.listeners[channel].map(function (handler) {
                    handler(data)
                });
            }
        }
    }
};

module.exports = new EventBus();