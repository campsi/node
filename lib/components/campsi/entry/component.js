var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var context = require('app-context')();


module.exports = Campsi.extend('component', 'campsi/entry', function ($super) {
    return {

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
            this.form.setOptions({fields: this.options.fields}, next);
        },

        valueDidChange: function (next) {
            this.form.setValue(this.value.data, next);
            this.trigger('change');
        },

        serializeOptions: function () {
            return {
                _id: this._id,
                identifier: this.identifier
            }
        },

        getDefaultValue: function () {

            return {
                _id: null,
                data: {}
            }
        },

        serializeValue: function () {

            return {
                _id: this.value._id,
                data: {}
            }
        },

        save: function () {

            var instance = this;
            var collectionUrl = Campsi.urlApi(context._project, context._collection);
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
                    instance.trigger('reset');
                });
            });
        }
    }
});
