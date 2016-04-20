'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('component', 'button', function () {
    return {
        getTagName: function () {
            return 'button';
        },
        optionsDidChange: function (next) {
            this.mountNode.text(this.options.text);
            next();
        }
    };
});