var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');
var page = require('page');

module.exports = Campsi.extend('component', 'campsi/project/users', function ($super) {
    return {

        getInvitationFormOptions: function () {
            var instance = this;
            return {
                fields: [
                    {
                        type: 'text',
                        name: 'email',
                        required: true,
                        label: instance.context.translate('panels.projectUsers.invite.email.label')
                    }, {
                        type: 'checkbox/group',
                        name: 'roles',
                        label: instance.context.translate('panels.projectUsers.invite.roles.label'),
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
                    }, {
                        type: 'text/area',
                        name: 'message',
                        label: instance.context.translate('panels.projectUsers.invite.message.label')
                    }, {
                        type: 'checkbox',
                        name: 'sendMail',
                        label: instance.context.translate('panels.projectUsers.invite.sendEmail.label')
                    }
                ]
            }
        },
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
                            options: instance.getInvitationFormOptions(),
                            value: {roles: ['admin'], sendMail: true},
                            context: instance.context
                        }, function (comp) {
                            instance.invitationForm = comp;
                            instance.nodes.form = $('<form class="invitation">');
                            instance.nodes.form.append($('<h3></h3>').html(instance.context.translate('panels.projectUsers.invite.title')));
                            instance.nodes.form.find('h3').prepend($('<img>').attr('src', '/images/airmail.png'));

                            var $content = $('<div class="content">');
                            $content.append(instance.invitationForm.render());
                            $content.append($('<button>').text(instance.context.translate('panels.projectUsers.invite.button')));
                            instance.nodes.form.append($content);
                            cb();
                        })
                    }

                ], function () {
                    instance.mountNode.append($('<h3 class="users">').text(instance.context.translate('panels.projectUsers.users.title')));
                    instance.mountNode.append(instance.userList.render());
                    instance.mountNode.append($('<h3 class="guests">').text(instance.context.translate('panels.projectUsers.guests.title')));
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
            var projectResource = instance.context.getResource('project');
            instance.mountNode.find('h3.users').toggleClass('visible', instance.value.users && instance.value.users.length > 0);
            instance.mountNode.find('h3.guests').toggleClass('visible', instance.value.guests && instance.value.guests.length > 0);

            if (Array.isArray(instance.value.guests) && projectResource.data) {
                var projectId = projectResource.data._id;

                instance.value.guests.forEach(function (guest) {
                    guest.projectRoles = [];
                    guest.invitations.forEach(function (invitation) {
                        if (invitation._project.toString() === projectId.toString()) {
                            guest.projectRoles = invitation.roles;
                        }
                    });
                });
            }

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
                    invitationForm: 'form .component.form'
                }, function (selector, prop, cb) {
                    Campsi.wakeUp(instance.mountNode.find(selector)[0], context, function (comp) {
                        instance[prop] = comp;
                        cb();
                    })
                }, next);
            });
        },

        getNodePaths: function () {
            return {
                form: '> form'
            }
        },

        attachEvents: function () {
            this.userList.attachEvents();
            this.userList.bind('change', this.onListChangeHandler.bind(this));

            this.guestList.attachEvents();
            this.guestList.bind('change', this.onListChangeHandler.bind(this));

            this.invitationForm.attachEvents();
            this.mountNode.find('form').on('submit', this.sendInvitation.bind(this));

            this.nodes.form.find('h3').click(function () {
                $(this).next('.content').toggleClass('visible');
            });
        },

        onListChangeHandler: function () {
            var value = {users: this.userList.value, guests: this.guestList.value};
            this.setValue(value);
        },

        sendInvitation: function () {

            var instance = this;
            var data = this.invitationForm.value;

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

            var userDiff = arrayDiff(this.savedValue.users, this.value.users);
            var guestsDiff = arrayDiff(this.savedValue.guests, this.value.guests);

            var instance = this;
            async.parallel([
                function (next) {
                    async.forEach(userDiff, function (operation, cb) {
                        if (operation.type === 'remove') {
                            return instance.removeUser(instance.savedValue.users[operation.index], cb);
                        }
                        cb();
                    }, next);
                },
                function (next) {
                    async.forEach(guestsDiff, function (operation, cb) {
                        if (operation.type === 'remove') {
                            return instance.removeGuest(instance.savedValue.guests[operation.index], cb);
                        }
                        cb();
                    }, next);
                }
            ], function () {
                instance.context.invalidate('projectUsers');
                instance.trigger('saved');
                page(instance.context.applicationURL('projectUsers'));
            });
        },

        removeUser: function (user, cb) {
            $.ajax({
                method: 'DELETE',
                url: this.context.apiURL('projectUsers') + '/' + user._id
            }).done(cb).fail(cb);
        },

        removeGuest: function (guest, cb) {
            $.ajax({
                method: 'DELETE',
                url: this.context.apiURL('projectGuests') + '/' + guest._id
            }).done(cb).fail(cb);
        }
    }
});