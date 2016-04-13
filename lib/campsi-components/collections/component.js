var Campsi = require('campsi-core');

module.exports = Campsi.extend('component', 'campsi/collections', function ($super) {

    return {

        getDefaultOptions: function () {
            return {};
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('campsi/collection-list', {context: instance.context}, function(collectionList){
                    instance.collectionList = collectionList;
                    instance.nodes.collectionList = instance.collectionList.render();
                    instance.mountNode.append(instance.nodes.collectionList);
                    next();
                });
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.collectionList, context, function(collectionList){
                    instance.collectionList = collectionList;
                    next();
                });

            })
        },

        attachEvents: function(){
            var instance = this;
            this.collectionList.attachEvents();
            this.collectionList.bind('change', function(){
                instance.setValue(instance.collectionList.value);
            });
        },

        getNodePaths: function () {
            return {
                collectionList: '> .campsi_collection-list'
            };
        },

        optionsDidChange: function (next) {
            next();
        },

        valueDidChange: function (next) {
            this.collectionList.setValue(this.value, next);
        }
    }
});