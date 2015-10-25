var Campsi = require('campsi');
var async = require('async');
var context = require('app-context')();


Campsi.extend('component', 'campsi/entries', function ($super) {


    return {

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
            if (this.value) {
                this.entryList.setValue(this.value, next);
            } else {
                next();
            }
        },

        attachEvents: function () {
            var instance = this;
            this.entryList.attachEvents();
            this.entryList.bind('change', function () {
                instance.value = instance.entryList.value;
                instance.trigger('change');
            });
        },

        save: function () {

            var instance = this;
            var url = Campsi.urlApi(context._project, instance.value);
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
        },

        serializeOptions: function () {
        }
    }
});