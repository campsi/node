'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'date/time', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {

                instance.nodes.hours = $('<select>');
                instance.nodes.separator = $('<span>:</span>');
                instance.nodes.minutes = $('<select>');

                var i = 0, h, m;
                for(;i<24;i++){
                    h = (i<10) ? '0' + i.toString() : i.toString();
                    instance.nodes.hours.append($('<option>').attr('value', h).text(h));
                }

                i = 0;
                for(;i<60;i++){
                    m = (i<10) ? '0' + i.toString() : i.toString();
                    instance.nodes.minutes.append($('<option>').attr('value', m).text(m));
                }

                instance.mountNode.append(instance.nodes.hours);
                instance.mountNode.append(instance.nodes.separator);
                instance.mountNode.append(instance.nodes.minutes);
                next();
            });
        }
    };
});