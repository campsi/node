var Campsi = require('campsi');
var async = require('async');

Campsi.extend('component', 'campsi/entries', function ($super) {


    return {

        resolveParam: function (param) {

            if (param === 'project' && this.value.__project) {
                return this.value.__project.identifier || this.value.__project._id;
            }
            if (param === 'collection') {
                return this.value.identifier || this.value._id;
            }
        },

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
                    instance.project = instance.value.__project;
                    instance.collection = instance.value;
                    next();
                });
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            if (instance.value._id) {
                instance.project = instance.value.__project.identifier || instance.value._project;
                instance.collection = instance.value.identifier || instance.value._id;

                instance.value.entries.forEach(function (e) {
                    e.__collectionUrl = '/projects/' + instance.project + '/collections/' + instance.collection;
                });

                this.entryList.setValue(this.value.entries, next);
            } else {
                next();
            }
        },

        optionsDidChange: function (next) {
            this.entryList.setTemplate(this.options.template, next)
        },

        attachEvents: function () {
            var instance = this;
            this.entryList.attachEvents();
            this.entryList.bind('change', function () {
                instance.value.entries = instance.entryList.value;
                instance.trigger('change');
            });
        },

        reload: function (next) {
            var instance = this;
            var template;

            var collectionUrl = Campsi.urlApi(this.project, this.collection);

            $.getJSON(collectionUrl + '?with=entries', function (collection) {
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
        },

        load: function (project, collection, next) {
            this.collection = collection;
            this.project = project;
            this.reload(next);
        },
        save: function () {

            var instance = this;
            var url = Campsi.urlApi(instance.value.__project, instance.value);
            var method = 'PUT';
            var data = {entries: this.value.entries};
            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(data)
            }).done(function () {
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        }

    }
});