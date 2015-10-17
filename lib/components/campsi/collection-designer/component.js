var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection-designer', function ($super) {

    return {


        resolveParam: function (param) {

            if (param === 'project' && this.value.__project) {
                return this.value.__project.identifier || this.value.__project._id;
            }
            if (param === 'collection') {
                return this.value.identifier || this.value._id;
            }
        },

        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'fields',
                    type: 'campsi/component-list'
                }]
            };
        },

        reload: function (next) {
            var instance = this;
            $.getJSON(Campsi.urlApi(this.value._project, this.value._id), function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },
        load: function (project, collection, cb) {
            this.value._project = project;
            this.value._id = collection;
            this.reload(cb);
        },

        save: function () {

            console.info(this.value);

            var instance = this;
            var url = Campsi.urlApi(this.value.__project);

            var method = 'POST';

            if (instance.value._id) {
                url = Campsi.urlApi(this.value.__project, this.value);
                method = 'PUT';
            }

            $.ajax({
                url: url,
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
                _id: this.value._id,
                name: this.value.name,
                identifier: this.value.identifier,
                __project: this.value.__project
            };
        }

    }
});