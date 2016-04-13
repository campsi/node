var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');

module.exports = Campsi.extend('component', 'select/ajax', function ($super) {

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
                    type: 'text',
                    required: true,
                    additionalClasses: ['horizontal']
                }, {
                    label: 'Collection type',
                    type: 'select/radios',
                    name: 'collectionType',
                    additionalClasses: ['horizontal'],
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
                }]
            }
        },

        getTagName: function () {
            return 'select';
        },

        attachEvents: function () {
            if (this.eventsAttached) {
                return;
            }

            console.info("ajax attachEvents", this.mountNode.get(0));
            var instance = this;
            this.mountNode.attr('disabled', true);
            this.mountNode.on('change', function () {
                instance.setValue($(this).val());
            });
            this.reload();
            this.eventsAttached = true;
        },

        reload: function () {
            if (typeof this.options.url === 'undefined') {
                return;
            }

            var instance = this;

            $.getJSON('/ajax-proxy?url=' + this.options.url).done(function (json) {
                instance.createOptions(json);
            }).error(function () {
                console.error('error', arguments)
            });
        },

        createOptions: function (data) {
            var instance = this;
            var options = [];
            var ref = data;

            var pathLookup = function (object, path) {
                var ref = object;
                var parts = path.split('.');
                parts.forEach(function (part) {
                    if (part in ref) {
                        ref = ref[part];
                    }
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
                        options.push($('<option>').attr('value', p).text(ref[p]));
                    }
                }
            }

            instance.mountNode.empty().append(options);

            if (instance.value) {
                instance.mountNode.val(instance.value);
            }

            instance.mountNode.attr('disabled', false);
        },

        optionsDidChange: function (next) {
            if (isBrowser) {
                this.reload();
            }
            next();
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next();
        }
    }
});