var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'text', function ($super) {
    return {

        getDefaultValue: function () {
            return ''
        },

        getTagName: function () {
            return 'input'
        },

        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'text');
                next.call(this);
            });
        },

        renderValue: function(){
            return $('<p>')
                .addClass('text')
                .attr('data-name', this.options.name)
                .text(this.value);
        },

        getAdvancedFormOptions: function () {
            return {
                fields: [{
                    type: 'text',
                    name: 'beginsWith',
                    label: 'begins with',
                    additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'contains',
                    label: 'contains',
                    additionalClasses: ['horizontal']
                }, {
                    type: 'text',
                    name: 'endsWith',
                    label: 'ends with',
                    additionalClasses: ['horizontal']
                }, {
                    type: 'array',
                    name: 'match',
                    label: 'matches',
                    items: {
                        type: 'text',
                        name: 'pattern'
                    }
                }]
            }
        },

        focus: function () {
            this.mountNode.focus();
        },

        attachEvents: function () {
            var instance = this;

            this.mountNode.on('change', function () {
                instance.setValue($(this).val());
            });
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next();
        },

        optionsDidChange: function (next) {
            if (this.options.placeholder) {
                this.mountNode.attr('placeholder', this.options.placeholder);
            }

            this.mountNode.attr('name', this.id + '-' + this.options.name);
            this.mountNode.attr('disabled', (this.options.disabled));
            next();
        },

        processValue: function (value, callback) {
            var opt = this.options;
            var errors = [];
            value = String(value);

            if (value === '') {
                return callback(errors, value);
            }

            if (opt.beginsWith && value.indexOf(opt.beginsWith) !== 0) {
                errors.push('beginsWith');
            }

            if (opt.endsWith && value.lastIndexOf(opt.endsWith) !== value.length - opt.endsWith.length) {
                errors.push('endsWith');
            }
            callback(errors, value);
        }
    }
});