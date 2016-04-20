'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('file', 'file/image', function () {
    return {
        getDefaultOptions: function () {
            return {
                renderer: { type: 'file/renderer/image' },
                getHtml: { height: 200 }
            };
        },
        getTemplate: function (options, callback) {
            callback('<img src="{{ this.src }}"/>');
        },
        getHtml: function (data, options, callback) {
            var $img = $('<img>');
            $img.attr('src', data.src + '?fit=max&h=150&w=150');
            return callback($img);
        }
    };
});