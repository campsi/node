'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'campsi/reference/collection-fields', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                //instance.mountNode.append('<thead>' +
                //    '<tr>' +
                //    '<th>Label</th>' +
                //    '<th>Name</th>' +
                //    '<th></th>' +
                //    '<th></th>' +
                //    '</tr>' +
                //    '</thead><tbody></tbody>');
                instance.mountNode.append('<tbody>');
                next();
            });
        },
        getTagName: function () {
            return 'table';
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                next();
            });
        },
        getDefaultValue: function () {
            return {};
        },
        attachEvents: function () {
            var instance = this;
            instance.mountNode.on('click', 'button', function () {
                var $btn = $(this);
                var $field = $btn.closest('.field');
                var fieldName = $field.attr('data-name');
                var newValue = $.extend(true, {}, instance.value);
                //var parts = fieldName.split('.');
                //var ref = newValue;
                //
                //for (var i = 0; i < parts.length; i++) {
                //    if (typeof ref[parts[i]] === 'undefined') {
                //        ref[parts[i]] = {};
                //    }
                //
                //    ref = ref[parts[i]];
                //}
                if (typeof newValue[fieldName] === 'undefined') {
                    newValue[fieldName] = {};
                }
                newValue[fieldName][$btn.attr('data-option')] = !$btn.hasClass('checked');
                instance.setValue(newValue);
            });
        },
        createFields: function (fields, parent) {
            var instance = this;
            fields.forEach(function (field) {
                var globalFieldName = field.name;
                if (typeof parent !== 'undefined') {
                    globalFieldName = parent + '/' + globalFieldName;
                }
                var depth = globalFieldName.split('/').length;
                var pad = function (depth) {
                    var str = '';
                    var i = 0;
                    for (; i < (depth - 1) * 3; i++) {
                        str += '&nbsp;';
                    }
                    return str;
                };
                var $tr = $('<tr class="field">').attr('data-name', globalFieldName);
                $tr.append($('<td class="field-label">').html(pad(depth) + field.label));
                $tr.append($('<td class="field-name">').text(field.name));
                $tr.append($('<td><button data-option="hide" data-default="off"><i class="fa" data-on="eye" data-off="eye-slash"></i></button></td>'));
                $tr.append($('<td><button data-option="embed" data-default="on"><i class="fa" data-on="link" data-off="chain-broken"></i></button></td>'));
                instance.mountNode.append($tr);
                if (Array.isArray(field.fields)) {
                    instance.createFields(field.fields, globalFieldName);
                }
                if (field.items && Array.isArray(field.items.fields)) {
                    instance.createFields(field.items.fields, globalFieldName);
                }
            });
        },
        optionsDidChange: function (next) {
            var instance = this;
            instance.mountNode.find('tbody').empty();
            if (Array.isArray(instance.options.fields)) {
                instance.createFields(instance.options.fields);
                instance.updateFields();
            }
            next();
        },
        getValueForPath: function (path) {
            var parts = path.split('.');
            var ref = this.value;
            parts.forEach(function (part) {
                ref = ref && ref[part] ? ref[part] : undefined;
            });
            return ref;
        },
        updateFields: function () {
            var instance = this;
            instance.mountNode.find('tr.field').each(function () {
                var path = $(this).attr('data-name');
                var value = instance.value[path];
                var $tr = $(this);
                [
                    'hide',
                    'embed'
                ].forEach(function (option) {
                    var $btn = $tr.find('button[data-option=' + option + ']');
                    var active;
                    if (!value || typeof value[option] === 'undefined') {
                        active = option !== 'hide';
                    } else {
                        active = value[option] !== false;
                    }
                    $btn.toggleClass('checked', active);
                    if (option === 'hide') {
                        active = !active;
                    }
                    var $i = $btn.find('i');
                    $i.toggleClass('fa-' + $i.attr('data-on'), active).toggleClass('fa-' + $i.attr('data-off'), !active);
                });
            });
        },
        valueDidChange: function (next) {
            if (typeof this.value !== 'undefined') {
                this.updateFields();
            }
            next();
        }
    };
});