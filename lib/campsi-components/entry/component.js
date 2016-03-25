var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var page = require('page');
var extend = require('extend');

module.exports = Campsi.extend('component', 'campsi/entry', function ($super) {
    return {

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('form', {
                    options: instance.options,
                    value: instance.value,
                    context: instance.context
                }, function (form) {
                    instance.form = form;
                    instance.mountNode.append(form.render());
                    instance.mountNode.append('' +
                        '<div class="big-buttons">' +
                        '   <button class="save">' + instance.context.translate('entry.save.button') + '</button> ' +
                        '   <button class="publish">' + instance.context.translate('entry.publish.draft') + '</button>' +
                        '   <button class="remove">' + instance.context.translate('entry.remove.draft') + '</button>' +
                        '</div>');
                    next();
                });
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {

                if (typeof instance.nodes.form !== 'undefined') {
                    Campsi.wakeUp(instance.nodes.form[0], context, function (comp) {
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
            instance.mountNode.find('.big-buttons').on('click', '.save', function () {
                instance.save();
            }).on('click', '.remove', function () {
                instance.remove();
            }).on('click', '.publish', function () {
                instance.publish();
            });

        },

        formChangeHandler: function () {
            this.setValue(extend({}, this.value, {data: this.form.value}));
        },

        optionsDidChange: function (next) {
            this.form.setOptions({fields: this.options.fields}, next);
        },

        valueDidChange: function (next) {
            this.form.setValue(this.value.data, next, false);
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
                data: {},
                draft: this.value.draft
            }
        },

        delete: function () {
            var instance = this;
            var url = this.context.apiURL('collection');
            var method = 'DELETE';
            var isDraft = (typeof this.value._entry !== 'undefined' || this.value.draft === true);

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
                    instance.context.invalidate('entriesAndDrafts');
                    page(instance.context.applicationURL('entriesAndDrafts'))
                });
            });
        },

        publish: function () {

            var instance = this;

            if (instance.form.errors.length > 0) {
                alert('Errors, can\'t save');
                return false;
            }

            var url = this.context.apiURL('collection') + '/entries';
            var body = {data: this.value.data};

            var method = 'POST';

            var isDraft = typeof this.value.draft !== 'undefined';

            if (isDraft) { // user is editing a draft
                if (this.value._entry) { // the draft references an entry
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
                    instance.context.set('entry', instance.value);
                    instance.context.invalidate('entriesAndDrafts');
                    instance.mountNode.closest('.panel').removeClass('modified');
                    page(instance.context.applicationURL('entry'));
                });
            });
        },

        save: function () {

            var instance = this;
            var collectionUrl = instance.context.apiURL('collection');
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
                    instance.context.set('draft', instance.value);
                    instance.context.invalidate('entriesAndDrafts');
                    instance.mountNode.closest('.panel').removeClass('modified');
                    page(instance.context.applicationURL('draft'));
                });
            });
        }
    }
});
