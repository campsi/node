var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
module.exports = Campsi.extend('component', 'campsi/project/users', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                async.parallel([
                    function (cb) {
                        Campsi.create('text', {placeholder: 'Email or name', additionalClasses: ['search']}, undefined, function (comp) {
                            instance.search = comp;
                            cb();
                        });
                    },
                    function (cb) {
                        Campsi.create('array', {items: {type: 'campsi/project/users/user'}, additionalClasses: ['user-list']}, undefined, function (comp) {
                            instance.list = comp;
                            cb();
                        })
                    },
                    function (cb) {
                        Campsi.create('form', {fields: [
                            {
                                type: 'text',
                                name: 'email',
                                label: 'email'
                            }, {
                                type: 'text',
                                name: 'firstName',
                                label: 'first name'
                            }, {
                                type: 'text',
                                name: 'lastName',
                                label: 'last name'
                            }, {
                                type: 'text',
                                name: 'company',
                                label: 'company'
                            }
                        ], additionalClasses: ['invitation']}, undefined, function (comp) {
                            instance.invitationForm = comp;
                            cb();
                        })
                    }

                ], function () {
                    instance.mountNode.append(instance.search.render());
                    instance.mountNode.append(instance.list.render());
                    instance.mountNode.append(instance.invitationForm.render());
                    next();
                });

            });
        },

        valueDidChange: function (next) {
            console.info(this.value);
            this.list.setValue(this.value.designers, next);
        },
        wakeUp: function (el, next) {
            var instance = this;

            $super.wakeUp.call(this, el, function(){
                Campsi.wakeUp(instance.mountNode.find('.search')[0], function(search){
                    instance.search = search;

                    Campsi.wakeUp(instance.mountNode.find('.user-list')[0], function(list){
                        instance.list = list;
                        next();
                    })
                });
            });
        },

         attachEvents: function () {
            this.search.attachEvents();
            this.list.attachEvents();

         }
    }
});