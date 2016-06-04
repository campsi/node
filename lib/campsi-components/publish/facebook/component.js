'use strict';

var Campsi = require('campsi-core');
var async = require('async');

module.exports = Campsi.extend('form', 'campsi/publish/facebook', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                fields: [{
                    type: 'select/radios',
                    name: 'post',
                    options: [{
                        label: 'Do not post',
                        value: 'no'
                    }, {
                        label: 'When entry is published',
                        value: 'now'
                    }, {
                        label: 'Schedule for later',
                        value: 'later'
                    }],
                    visible: '{../value/post_id} == ""'
                }, {
                    type: 'date/datetime',
                    name: 'datetime',
                    label: 'Date & Time',
                    visible: '({../value/post} == "later") and {../value/post_id} == ""'
                }, {
                    type: 'text/area',
                    name: 'message',
                    label: 'Message',
                    visible: '({../value/post} == "now" or {../value/post} == "later") and {../value/post_id} == ""'
                },{
                    type: 'campsi/publish/facebook/post',
                    name: 'post_id'
                }]
            };
        },

        getDesignerFormOptions: function () {
            return {
                fields: [{
                    type: 'campsi/publish/facebook/feed-chooser',
                    name: 'feed',
                    label: 'Choose a feed to publish on'
                }, {
                    type: 'form',
                    name: 'linkFields',
                    label: 'Associated fields to link',
                    fields: [{
                        type: 'text',
                        name: 'name',
                        label: 'Name',
                        additionalClasses: ['horizontal']
                    }, {
                        type: 'text',
                        name: 'description',
                        label: 'Description',
                        additionalClasses: ['horizontal']
                    }, {
                        type: 'text',
                        name: 'image',
                        label: 'Image',
                        additionalClasses: ['horizontal']
                    }, {
                        type: 'text',
                        name: 'url',
                        label: 'URL',
                        additionalClasses: ['horizontal']
                    }]
                }]
            }
        }
        //,

        //defineHooks: function(){
        //    Campsi.eventbus.on('entry:create', function(data, event){
        //        Collection.findOne({_id: data._collection.id}, function(err, collection){
        //
        //        });
        //    });
        //}
    }
});