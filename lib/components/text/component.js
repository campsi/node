'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'text', function ($super) {
    return {
        getDefaultValue: function () {
            return '';
        },
        getTagName: function () {
            return 'input';
        },
        init: function (next) {
            $super.init.call(this, function () {
                this.mountNode.attr('type', 'text');
                next.call(this);
            });
        },
        getHtml: function (data, options, callback) {
            var $p = $('<p>');
            $p.addClass('text');
            $p.text(data);
            callback($p);
        },
        renderValue: function () {
            var $p = $('<p>');
            $p.addClass('text');
            $p.attr('data-name', this.options.name);
            $p.text(this.value);
            return $p;
        },
        getAdvancedFormOptions: function () {
            var t = this.context.translate.bind(this.context);
            return {
                fields: [
                    {
                        type: 'text',
                        name: 'beginsWith',
                        label: t('comp.text.beginsWith.label'),
                        additionalClasses: []
                    },
                    {
                        type: 'text',
                        name: 'contains',
                        label: t('comp.text.contains.label'),
                        additionalClasses: []
                    },
                    {
                        type: 'text',
                        name: 'endsWith',
                        label: t('comp.text.endsWith.label'),
                        additionalClasses: []
                    },
                    {
                        type: 'array',
                        name: 'match',
                        label: t('comp.text.matches.label'),
                        additionalClasses: [],
                        items: {
                            type: 'text',
                            name: 'pattern'
                        }
                    }
                ]
            };
        },
        focus: function () {
            this.mountNode.focus();
        },
        submit: function () {
            this.trigger('submit');
        },
        attachEvents: function () {
            var instance = this;
            if (instance.eventsAttached) {
                return;
            }
            instance.eventsAttached = true;
            this.mountNode.on('change', function () {
                instance.setValue($(this).val());
            });
            this.mountNode.off('keyup').on('keyup', function (e) {
                if (e.keyCode === 13) {
                    return instance.submit();
                }
                if ($(this).val() !== instance.value) {
                    instance.setValue($(this).val());
                }
            });
            this.mountNode.on('focus', function () {
                instance.trigger('focus');
            });
            this.mountNode.on('blur', function () {
                instance.trigger('blur');
            });
        },
        valueDidChange: function (next) {
            if (this.mountNode.val() !== this.value) {
                this.mountNode.val(this.value);
            }
            next();
        },
        optionsDidChange: function (next) {
            if (this.options.placeholder) {
                this.mountNode.attr('placeholder', this.options.placeholder);
            }
            this.mountNode.attr('name', this.id + '-' + this.options.name);
            this.mountNode.attr('disabled', this.options.disabled);
            this.mountNode.attr('size', this.options.size);
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
    };
});