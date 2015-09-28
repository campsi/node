var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/project', function ($super) {

    return {

        getDefaultOptions: function () {

            return {
                fields: [{
                    name: 'title',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    label: 'Icon',
                    name: 'icon',
                    type: 'file/image',
                    additionalClasses: ['icon']
                }, {
                    name: 'admins',
                    label: 'Admins',
                    type: 'campsi/user-list',
                    additionalClasses: ['admins']
                }, {
                    name: 'designers',
                    label: 'Designers',
                    type: 'campsi/user-list',
                    additionalClasses: ['designers']
                }, {
                    name: 'collections',
                    label: 'Collections',
                    type: 'campsi/collection-list',
                    additionalClasses: ['collections']
                }]
            }
        },
        attachEvents: function () {

            $super.attachEvents.call(this);

            var instance = this;

            instance.fields.collections.bind('design', function (id) {
                instance.trigger('design-collection', id);
            });
            instance.fields.collections.bind('admin', function (id) {
                instance.trigger('admin-collection', id);
            });
        },

        load: function (id, next) {
            var instance = this;
            var projectUrl = '/api/v1/projects/' + id;
            $.getJSON(projectUrl, function (data) {
                instance.setValue(data, function () {
                    next();
                });
            });
        },

        save: function () {

            var instance = this;
            var projectUrl = '/api/v1/projects';
            var method = 'POST';

            if (instance.value._id) {
                projectUrl += '/' + instance.value._id;
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
        }
    }

});