var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var context = require('app-context')();


module.exports = Campsi.extend('component', 'campsi/entry', function ($super) {
    return {

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('form', {options: instance.options, value: instance.value}, function (form) {
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

        delete: function () {
            var instance = this;
            var url = Campsi.urlApi(context._project, context._collection);
            var method = 'DELETE';
            var isDraft = (typeof this.value._entry !== 'undefined' || this.value.draft === true);

            console.info(this.value);

            if (isDraft) {
                url += '/drafts/';

            } else {
                url += '/entries/';
            }
            url += this.value._id;

            $.ajax({
                url: url,
                method: method
            }).done(function () {
                instance.setValue({}, function () {
                    instance.trigger('deleted');
                    instance.trigger('reset');
                });
            });
        },

        publish: function () {

            var instance = this;
            var collectionUrl = Campsi.urlApi(context._project, context._collection);
            var url = collectionUrl + '/entries';
            var body = {data: this.value.data};

            var method = 'POST';

            var isDraft = typeof this.value.draft !== 'undefined';

            if (isDraft) { // user is editing a draft
                if (typeof this.value._entry !== 'undefined') { // the draft references an entry
                    url += '/' + this.value._entry;
                    method = 'PUT';
                }
                body._draft = this.value._id;
            } else if (this.value._id) {  // user is editing a published entry and wants to publish its content
                url += '/' + this.value._id;
                method = 'PUT';
            }
            $.ajax({
                url: url,
                method: method,
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(body)
            }).done(function (data) {
                instance.setValue(data, function () {
                    instance.trigger('published');
                    instance.trigger('reset');
                });
            });
        },

        save: function () {

            var instance = this;
            var collectionUrl = Campsi.urlApi(context._project, context._collection);
            var url = collectionUrl + '/drafts/';
            var body = {data: this.value.data};

            var method = 'POST';

            if (this.value.draft) {
                if (this.value.draft === true) {
                    url += this.value._id;
                } else {
                    url += this.value.draft._id;
                    body._entry = this.value._id;
                }
                url += this.value.draft._id;
                method = 'PUT';
            } else {
                body._entry = this.value._id;
            }

            $.ajax({
                url: url,
                method: method,
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(body)
            }).done(function (data) {
                instance.setValue(data, function () {
                    instance.trigger('saved');
                    instance.trigger('reset');
                });
            });
        }
    }
});
