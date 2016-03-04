var Campsi = require('campsi');

module.exports = Campsi.extend('component', 'campsi/collection/intro', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.html(instance.context.translate('panels.collection.intro'));
                next();
            });
        }
    }
});
