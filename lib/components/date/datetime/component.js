'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');
module.exports = Campsi.extend('component', 'date/datetime', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                async.parallel([function(dateCb){
                    Campsi.create('date', {context: instance.context}, function(dateComponent){
                        instance.dateComponent = dateComponent;
                        dateCb();
                    });
                }, function(timeCb){
                    Campsi.create('date/time', {context: instance.context}, function(dateComponent){
                        instance.timeComponent = dateComponent;
                        timeCb();
                    });
                }], function dateAndTimeCreated(){
                    instance.mountNode.append(instance.dateComponent.render());
                    instance.mountNode.append(instance.timeComponent.render());
                    next();
                });
            });
        },


        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                next();
            })
        },

        attachEvents: function(){
            var instance = this;
            $super.attachEvents.call(instance);
        }
    };
});