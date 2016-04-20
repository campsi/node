'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('component', 'campsi/code-editor', function ($super) {
    return {
        getTagName: function () {
            return 'button';
        },
        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.text('edit');
                next();
            });
        },
        attachEvents: function () {
            var instance = this;
            this.mountNode.on('click', function () {
                Campsi.openCodeEditor(instance.options, instance.value, function (newValue) {
                    instance.setValue(newValue);
                });
            });
        }
    };
});