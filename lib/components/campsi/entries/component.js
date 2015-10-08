var Campsi = require('campsi');
var async = require('async');

Campsi.extend('component', 'campsi/entries', function ($super) {


    return {

        getDefaultValue: function () {
            return {
                id: null,
                _project: null,
                selectedEntry: null,
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

        optionsDidChange: function (next) {
            this.entryList.setTemplate(this.options.template, next)
        },

        attachEvents: function () {
            this.entryList.attachEvents();
        },

        getCollectionUrl: function () {
            return '/api/v1/collections/' + this.value.collectionId;
        },
        getUrl: function () {
            return this.getCollectionUrl() + '/entries';
        },

        reload: function (next) {
            var instance = this;
            var template;
            // todo dégager ce truc dégueu très vite
            $.getJSON(instance.getCollectionUrl(), function (collection) {
                $.getJSON(instance.getUrl(), function (data) {
                    collection.entries = data;
                    collection.templates.forEach(function (t) {
                        if (t.identifier === 'entry') template = t;
                    });

                    async.parallel([
                        function (cb) {
                            instance.setValue(collection, function () {
                                instance.trigger('reset');
                                cb();
                            });
                        },
                        function (cb) {
                            if (template) {
                                instance.entryList.setTemplate(template.markup, function () {
                                    cb();
                                });
                            } else {
                                cb();
                            }
                        }
                    ], next);


                });

            });
        },

        load: function (id, next) {
            this.value.collectionId = id;
            this.reload(next);
        }
    }
});