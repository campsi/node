var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');
var page = require('page');
var extend = require('extend');

module.exports = Campsi.extend('component', 'campsi/project/users', function ($super) {
    return {

        getDefaultValue: function () {
            return {
                users: [],
                guests: []
            }
        },
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {

                async.parallel([
                    function (cb) {
                        Campsi.create('array', {
                            options: {
                                newItem: false,
                                items: {type: 'campsi/project/users/user'},
                                additionalClasses: ['user-list']
                            },
                            context: instance.context
                        }, function (comp) {
                            instance.userList = comp;
                            cb();
                        })
                    },
                    function (cb) {
                        Campsi.create('array', {
                            options: {
                                newItem: false,
                                items: {type: 'campsi/project/users/guest'},
                                additionalClasses: ['guest-list']
                            },
                            context: instance.context
                        }, function (comp) {
                            instance.guestList = comp;
                            cb();
                        })
                    },
                    function (cb) {
                        Campsi.create('form', {
                            options: {
                                fields: [
                                    {
                                        type: 'text',
                                        name: 'email',
                                        required: true,
                                        label: 'email'
                                    }, {
                                        type: 'checkbox/group',
                                        name: 'roles',
                                        label: 'roles',
                                        options: [
                                            {
                                                value: 'admin',
                                                label: instance.context.translate('panels.projectUsers.invite.roles.admin.label'),
                                                help: instance.context.translate('panels.projectUsers.invite.roles.admin.help')
                                            }, {
                                                value: 'designer',
                                                label: instance.context.translate('panels.projectUsers.invite.roles.designer.label'),
                                                help: instance.context.translate('panels.projectUsers.invite.roles.designer.help')
                                            }
                                        ]
                                    }
                                ]
                            }, context: instance.context
                        }, function (comp) {
                            instance.invitationForm = comp;
                            instance.nodes.form = $('<form class="invitation">');
                            instance.nodes.form.append($('<h3></h3>').text(instance.context.translate('panels.projectUsers.invite.title')));
                            instance.nodes.form.append($('<p class="envelope">').append($('<img>').attr('src', '/images/airmail.png')));
                            instance.nodes.form.append(instance.invitationForm.render());
                            instance.nodes.form.append($('<button>').text(instance.context.translate('panels.projectUsers.invite.button')));
                            cb();
                        })
                    }

                ], function () {
                    instance.mountNode.append($('<h3>').text(instance.context.translate('panels.projectUsers.users.title')));
                    instance.mountNode.append(instance.userList.render());
                    instance.mountNode.append($('<h3>').text(instance.context.translate('panels.projectUsers.guests.title')));
                    instance.mountNode.append(instance.guestList.render());

                    instance.mountNode.append(instance.nodes.form);
                    instance.mountNode.append('<div class="confirmation pane"><p><i class="fa fa-5x fa-check-circle"></i> <span></span></p></div>');
                    instance.mountNode.append('<div class="error pane"><p><i class="fa fa-5x fa-minus-circle"></i> <span></span></p></div>');
                    instance.mountNode.find('.confirmation.pane span').text(instance.context.translate('panels.projectUsers.invite.result.success'));
                    instance.mountNode.find('.error.pane span').text(instance.context.translate('panels.projectUsers.invite.result.error'));
                    next();
                });

            });
        },

        valueDidChange: function (next) {
            var instance = this;
            instance.userList.setValue(instance.value.users, function () {
                instance.guestList.setValue(instance.value.guests, next);
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;

            $super.wakeUp.call(this, el, context, function () {
                async.forEachOf({
                    userList: '.user-list',
                    guestList: '.guest-list',
                    invitationForm: 'form > .form'
                }, function (selector, prop, cb) {
                    Campsi.wakeUp(instance.mountNode.find(selector)[0], context, function (comp) {
                        instance[prop] = comp;
                        cb();
                    })
                }, next);
            });
        },

        attachEvents: function () {
            this.userList.attachEvents();
            this.userList.bind('change', this.onListChangeHandler.bind(this));

            this.guestList.attachEvents();
            this.guestList.bind('change', this.onListChangeHandler.bind(this));

            this.invitationForm.attachEvents();
            this.mountNode.find('form').on('submit', this.sendInvitation.bind(this))
        },

        onListChangeHandler: function () {
            var value = {users: this.userList.value, guests: this.guestList.value};
            this.setValue(value);
        },

        sendInvitation: function () {

            var data = {
                email: this.invitationForm.value.email,
                roles: []
            };

            var instance = this;


            if (instance.invitationForm.value.roles.indexOf('admin') > -1) {
                data.roles.push('admin');
            }

            if (instance.invitationForm.value.roles.indexOf('designer') > -1) {
                data.roles.push('designer');
            }

            $.ajax({
                url: instance.context.apiURL('project') + '/invitation',
                data: JSON.stringify(data),
                method: 'POST',
                contentType: 'application/json'
            }).done(function () {
                instance.context.invalidate('projectUsers');
                page(instance.context.applicationURL('projectUsers'));
                instance.invitationForm.resetValue(function () {
                    instance.showConfirmationPane();
                });

            }).error(function () {
                instance.showErrorPane();
            });

            return false;
        },

        showConfirmationPane: function () {
            this.showPane('confirmation');
        },

        showErrorPane: function () {
            this.showPane('error');
        },

        showPane: function (pane) {
            var $pane = this.mountNode.find('.' + pane);
            $pane.addClass('visible')
                .show()
                .css('opacity', 1);

            setTimeout(function () {
                $pane.fadeOut(500, function () {
                    $pane.removeClass('visible');
                })
            }, 1000);
        },

        serializeOptions: function () {
        },

        save: function () {
            var arrayDiff = require('../../../components/array/array-diff');
            var previousValue = this.getPreviousValue();

            var userDiff = arrayDiff(previousValue.users, this.value.users);
            var guestsDiff = arrayDiff(previousValue.guests, this.value.guests);
            var instance = this;
            async.parallel([
                function (next) {
                    async.forEach(userDiff, function (operation, cb) {
                        if (operation.type === 'remove') {
                            return instance.removeUser(previousValue.users[operation.index], cb);
                        }
                        cb();
                    }, next);
                },
                function (next) {
                    async.forEach(guestsDiff, function (operation, cb) {
                        if (operation.type === 'remove') {
                            return instance.removeGuest(previousValue.guests[operation.index], cb);
                        }
                        cb();
                    }, next);
                }
            ], function(){
                instance.context.invalidate('projectUsers');
                instance.trigger('saved');
                page(instance.context.applicationURL('projectUsers'));
            });
        },

        removeUser: function (user, cb) {
            $.ajax({
                method: "DELETE",
                url: this.context.apiURL('projectUsers') + '/' + user._id
            }).done(cb).fail(cb);
        },

        removeGuest: function (guest, cb) {
            $.ajax({
                method: "DELETE",
                url: this.context.apiURL('projectGuests') + '/' + guest._id
            }).done(cb).fail(cb);
        }
    }
});