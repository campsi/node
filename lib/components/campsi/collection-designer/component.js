var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection-designer', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'fields',
                    type: 'campsi/component-list'
                }]
            };
        },

        getUrl: function () {
            return '/api/v1/collections/' + this.value.id;
        },

        reload: function (next) {
            var instance = this;
            $.getJSON(instance.getUrl(), function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },
        load: function (id, cb) {
            this.value.id = id;
            this.reload(cb);
        },

        save: function () {

            var instance = this;
            var projectUrl = '/api/v1/collections';
            var method = 'POST';

            if (instance.value.id) {
                projectUrl += '/' + instance.value.id;
                method = 'PUT';
            }

            $.ajax({
                url: projectUrl,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function () {
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        serializeValue: function () {
            return {
                id: this.value.id,
                name: this.value.name,
                _project: this.value._project
            };
        }

    }
});