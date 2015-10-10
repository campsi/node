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
                    name: 'identifier',
                    type: 'text',
                    label: 'identifier',
                    additionalClasses: ['identifier']
                },{
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
        resolveParam: function(param){
            if(param === 'project') {
                return this.value.identifier || this.value._id;
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
            instance.fields.collections.bind('create-collection', function (template) {
                $.ajax({
                    url: '/api/v1/projects/' + instance.value.id + '/collections',
                    method: 'POST',
                    contentType: 'application/json'
                }).done(function (data) {
                    instance.value.collections.push(data);
                    instance.fields.collections.setValue(instance.value.collections, function () {
                        window.location.href = '/projects/' + instance.value.id + '/collections/' + data.id; // dispatch global event
                    });
                });
            });
        },

        valueDidChange: function(next){
            var instance = this;
            this.value.collections.forEach(function(collection){
                collection.__project = {
                    _id: instance.value._id,
                    identifier: instance.value.identifier
                };
            });
            $super.valueDidChange.call(this, next);
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
            }).done(function (data) {
                instance.value = data;
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        serializeValue: function () {
            return {
                id: this.value.id
            }
        }
    }

});