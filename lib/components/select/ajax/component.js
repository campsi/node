var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');
var config = require('../../../../browser-config');

module.exports = Campsi.extend('component', 'select/ajax', function () {

    return {

        getDefaultOptions: function () {
            return {};
        },

        getDesignerFormOptions: function () {

            // todo les additional classes sautent ?

            return {
                fields: [{
                    label: 'URL',
                    name: 'url',
                    type: 'url',
                    required: true,
                    additionalClasses: ['horizontal']
                }, {
                    label: 'Collection type',
                    type: 'select/radios',
                    name: 'collectionType',
                    additionalClasses: ['horizontal'],
                    inline: true,
                    options: [{
                        label: 'Array []',
                        value: 'array'
                    }, {
                        label: 'Object {}',
                        value: 'object'
                    }]
                }, {
                    type: 'form',
                    label: 'Paths',
                    name: 'paths',
                    fields: [{
                        name: 'root',
                        label: 'Root',
                        type: 'text',
                        placeholder: 'results.data.0.values',
                        additionalClasses: ['horizontal']
                    }, {
                        name: 'label',
                        label: 'Label',
                        type: 'text',
                        placeholder: 'fieldName',
                        additionalClasses: ['horizontal']
                    }, {
                        name: 'value',
                        label: 'Value',
                        type: 'text',
                        placeholder: '_id',
                        additionalClasses: ['horizontal']
                    }]
                }, {
                    type: 'checkbox',
                    label: 'Use Proxy',
                    name: 'proxy'
                }]
            }
        },

        getTagName: function () {
            return 'select';
        },

        attachEvents: function () {
            if (this.eventsAttached || !isBrowser) {
                return;
            }

            var instance = this;
            this.mountNode.on('change', function () {
                instance.setValue($(this).val());
            });
            this.eventsAttached = true;
        },

        reload: function (next) {
            if (typeof this.options.url === 'undefined') {
                return;
            }

            this.mountNode.attr('disabled', true);
            var instance = this;
            var url = (instance.options.useProxy !== false && isBrowser) ? config.host + '/ajax-proxy?url=' + this.options.url : this.options.url;

            $.get(url).done(function (json) {
                json = (typeof json === 'string') ? JSON.parse(json) : json;
                instance.createOptions(json, next);
            }).error(function () {
                console.error('error', arguments)
            });
        },

        createOptions: function (data, next) {

            var instance = this;
            var options = [];
            var ref = data;

            var pathLookup = function (object, path) {
                var ref = object;
                path.split('.').forEach(function (part) {
                    ref = (ref && part in ref) ? ref[part] : undefined;
                });
                return ref;
            };

            if (instance.options.paths && instance.options.paths.root) {
                ref = pathLookup(data, instance.options.paths.root);
            }

            if (instance.options.collectionType === 'array') {
                ref.forEach(function (item) {
                    var value = pathLookup(item, instance.options.paths.value);
                    var label = pathLookup(item, instance.options.paths.label);
                    options.push($('<option>').attr('value', value).text(label));
                });
            } else {
                var p;
                for (p in ref) {
                    if (ref.hasOwnProperty(p)) {
                        var label = (instance.options.paths && instance.options.paths.label) ?
                            pathLookup(ref[p], instance.options.paths.label) : ref[p];

                        options.push($('<option>').attr('value', p).text(label));
                    }
                }
            }

            instance.mountNode
                .empty()
                .append('<option></option>')
                .append(options);

            if (instance.value) {
                instance.mountNode.val(instance.value);
            }

            instance.mountNode.removeAttr('disabled', false);
            instance.trigger('loaded');
            next();
        },

        optionsDidChange: function (next) {
            this.reload(next);
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next();
        },

        serializeValue: function () {
            return this.value;
        }
    }
});