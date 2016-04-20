'use strict';
var Campsi = require('campsi-core');
Campsi.extend('component', 'campsi/project/intro', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.html(instance.context.translate('panels.project.intro'));
                next();
            });
        }
    };
});