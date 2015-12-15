var Campsi = require('campsi');

module.exports = Campsi.extend('component', 'button', function (/*$super*/) {

    return {
        getTagName: function () {
            return 'button';
        },

        optionsDidChange: function (next) {
            this.mountNode.text(this.options.text);
            next();
        }

    }
});