var Campsi = require('campsi');

Campsi.extend('component', 'campsi/entries', function ($super) {


    return {

        getDefaultValue: function () {
            return {
                collectionId: null,
                entries: []
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('campsi/entry-list', undefined, undefined, function (comp) {
                    instance.entryList = comp;
                    instance.mountNode.append(instance.entryList.render());
                    next();
                });
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('.component')[0], function (comp) {
                    instance.entryList = comp;
                    next();
                });
            });
        },

        valueDidChange: function (next) {
            this.entryList.setValue(this.value.entries, next);
        },

        attachEvents: function () {
            this.entryList.attachEvents();
        },

        getUrl: function () {
            return '/api/v1/collections/' + this.value.collectionId + '/entries';
        },

        reload: function (next) {
            var instance = this;
            $.getJSON(instance.getUrl(), function (data) {
                instance.setValue({collectionId: instance.value.collectionId, entries: data}, function(){
                    instance.trigger('reset');
                    next();
                });
            });
        },

        load: function (id, next) {
            this.value.collectionId = id;
            this.reload(next);
        }
    }
});