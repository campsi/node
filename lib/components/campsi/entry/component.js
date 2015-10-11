var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');

module.exports = Campsi.extend('component', 'campsi/entry', function ($super) {
    return {


        resolveParam: function (param) {

            if (param === 'project' && this.options.__project) {
                return this.options.__project.identifier || this.options.__project._id;
            }
            if (param === 'collection') {
                return this.options.identifier || this.options._id;
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('form', instance.options, instance.value, function (form) {
                    instance.form = form;
                    instance.mountNode.append(form.render());
                    next();
                });
            });
        },
        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {

                if (typeof instance.nodes.form !== 'undefined') {
                    Campsi.wakeUp(instance.nodes.form[0], function (comp) {
                        instance.form = comp;
                        instance.value.data = comp.value;
                        next();
                    });
                } else {
                    next();
                }
            });
        },

        getNodePaths: function () {
            return {
                form: '> .component.form'
            }
        },

        attachEvents: function () {
            var instance = this;
            instance.form.attachEvents();
            instance.form.bind('change', instance.formChangeHandler.bind(this));
        },

        formChangeHandler: function () {
            this.value.data = this.form.value;
            this.trigger('change');
        },
        optionsDidChange: function (next) {
            this.form.setOptions(this.options, next);
        },
        valueDidChange: function (next) {
            this.form.setValue(this.value.data, next);
            this.trigger('change');
        },

        serializeOptions: function () {
            return {
                __project: this.__project,
                _id: this._id,
                identifier: this.identifier
            }
        },

        getDefaultValue: function () {

            return {
                _id: null,
                _collection: null,
                index: null,
                data: {}
            }
        },
        serializeValue: function () {

            return {
                _id: this.value._id,
                _collection: this.value._collection,
                index: this.value.index,
                data: {}
            }
        },



        loadOptions: function (project, collection, cb) {

            var instance = this;
            var collectionUrl = Campsi.urlApi(project, collection);

            if (instance.collectionUrl === collectionUrl)
                return cb();

            $.getJSON(collectionUrl, function (data) {
                instance.setOptions(data, function () {
                    instance.form.attachEvents();
                    cb();
                });
            });
        },

        resetModel: function () {
            this.collectionUrl = undefined;
        },

        save: function () {

            var instance = this;
            var collectionUrl = Campsi.urlApi(this.options.__project, this.options);
            var entryUrl = collectionUrl + '/entries/';
            var method = 'POST';
            if (this.value._id) {
                entryUrl += this.value._id;
                method = 'PUT';
            }

            $.ajax({
                url: entryUrl,
                method: method,
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(this.value)
            }).done(function (data) {
                instance.setValue(data, function () {
                    instance.trigger('saved');
                });
            });
        },

        load: function (project, collection, entry, next) {
            var instance = this;
            var collectionUrl = Campsi.urlApi(project, collection);
            var entryUrl = Campsi.urlApi(project, collection, entry);
            var skipOptions = false;
            var skipValue = false;
            var collectionModel;
            var entryData;

            async.parallel([
                function (cb) {
                    if (instance.collectionUrl === collectionUrl) {
                        skipOptions = true;
                        return cb();
                    }

                    $.getJSON(collectionUrl, function (data) {
                        instance.collectionUrl = collectionUrl;
                        collectionModel = data;
                        cb();
                    });
                },
                function (cb) {

                    // todo check if modified ?

                    if (instance.entryUrl === entryUrl) {
                        skipValue = true;
                        return cb();
                    }

                    $.getJSON(entryUrl, function (data) {
                        instance.entryUrl = entryUrl;
                        entryData = data;
                        cb();
                    });
                }
            ], function () {
                async.series([
                    function (cb) {
                        (skipOptions) ? cb() : instance.setOptions(collectionModel, cb);
                    }, function (cb) {
                        (skipValue) ? cb() : instance.setValue(entryData, cb);
                    }, function (cb) {
                        instance.trigger('reset');
                        instance.form.attachEvents();
                        cb();
                    }], next);
            });
        }


    }
});
