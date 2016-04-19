var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('form', 'campsi/reference/collection-options', function ($super) {

    return {

        getDefaultValue: function () {
            return {
                url: null,
                fields: {}
            }
        },

        getDefaultOptions: function () {
            return {
                fields: [{
                    label: 'collection',
                    name: 'url',
                    type: 'select/ajax',
                    additionalClasses: ['horizontal', 'collection-select'],
                    collectionType: 'array',
                    useProxy: false,
                    url: this.context.apiURL('project'),
                    paths: {
                        root: 'collections',
                        label: 'name',
                        value: '_links.canonical'
                    }
                }, {
                    label: 'fields',
                    name: 'options',
                    type: 'campsi/reference/collection-fields',
                    additionalClasses: ['collection-fields']
                }]
            };
        },

        attachEvents: function () {
            var instance = this;
            $super.attachEvents.call(instance);
        },

        reload: function (next) {
            var instance = this;
            var options;
            $.get(instance.value.url).done(function (json) {
                if(typeof json === 'string'){
                    json = JSON.parse(json);
                }
                options = extend({type: 'form'}, instance.fields.options.options, {fields: json.fields});
                instance.fields.options.setOptions(options, next);
            });
        },

        valueDidChange: function (next) {

            var instance = this;
            var previousValue = instance.getPreviousValue();

            if (!this.value.url || previousValue.url === instance.value.url) {
                return $super.valueDidChange.call(this, next);
            }

            this.reload(function () {
                $super.valueDidChange.call(instance, next);
            });
        },

        serializeValue: function () {
            return {
                url: this.value.url,
                fields: this.value.fields
            }
        }
    }
});