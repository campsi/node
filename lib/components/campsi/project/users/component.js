var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
module.exports = Campsi.extend('component', 'campsi/project/users', function ($super) {
    return {
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.form = $('<form>');
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
                        Campsi.create('form', {
                            options: {
                                fields: [
                                    {
                                        type: 'text',
                                        name: 'email',
                                        label: 'email'
                                    }, {
                                        type: 'form',
                                        name: 'roles',
                                        label: 'roles',
                                        fields: [
                                            {
                                                type: 'checkbox',
                                                name: 'admin',
                                                label: instance.context.translate('panels.projectUsers.invite.roles.admin.label'),
                                                help: instance.context.translate('panels.projectUsers.invite.roles.admin.help')
                                            }, {
                                                type: 'checkbox',
                                                name: 'designer',
                                                label: instance.context.translate('panels.projectUsers.invite.roles.designer.label'),
                                                help: instance.context.translate('panels.projectUsers.invite.roles.designer.help')
                                            }
                                        ]
                                    }
                                ], additionalClasses: ['invitation']
                            }, context: instance.context
                        }, function (comp) {
                            instance.invitationForm = comp;
                            cb();
                        })
                    }

                ], function () {
                    instance.mountNode.append(instance.userList.render());
                    instance.nodes.form.append(instance.invitationForm.render());
                    instance.nodes.form.append($('<button>').text(instance.context.translate('panels.projectUsers.invite.button')));
                    instance.mountNode.append($('<h3></h3>').text(instance.context.translate('panels.projectUsers.invite.title')));
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

            if (typeof this.value._id === 'undefined') {
                return next();
            }

            if (this.value.users) {
                this.userList.setValue(this.value.users, next);
            } else {
                instance.context.get('projectUsers', function (users) {
                    instance.value.users = users;
                    instance.userList.setValue(instance.value.users, next);
                });
            }
        },
        wakeUp: function (el, context, next) {
            var instance = this;

            $super.wakeUp.call(this, el, context, function () {
                async.parallel([
                    function (cb) {
                        Campsi.wakeUp(instance.mountNode.find('.user-list')[0], context, function (list) {
                            instance.userList = list;
                            cb();
                        })
                    }, function (cb) {
                        Campsi.wakeUp(instance.mountNode.find('form > .form')[0], context, function (form) {
                            instance.invitationForm = form;
                            cb();
                        })
                    }
                ], next);
            });
        },

        attachEvents: function () {
            this.userList.attachEvents();
            this.invitationForm.attachEvents();
            this.mountNode.find('form').on('submit', this.sendInvitation.bind(this))
        },

        sendInvitation: function () {

            var data = {
                email: this.invitationForm.value.email,
                roles: []
            };

            var instance = this;

            if (instance.invitationForm.value.roles.admin) {
                data.roles.push('admin');
            }
            if (instance.invitationForm.value.roles.designer) {
                data.roles.push('designer');
            }

            $.ajax({
                url: instance.context.apiURL('project') + '/invitation',
                data: JSON.stringify(data),
                method: 'POST',
                contentType: 'application/json'
            }).done(function (data) {
                console.info('invitation sent', data);
                instance.invitationForm.resetValue(function () {
                    instance.showConfirmationPane();
                });

            }).error(function () {
                console.info('invitation error');
            });

            return false;
        },

        showConfirmationPane: function () {
            var $pane = this.mountNode.find('.confirmation').addClass('visible');
            setTimeout(function () {
                $pane.fadeOut(500, function () {
                    $pane.removeClass('visible');
                })
            }, 1000);
        },


        serializeOptions: function () {
        }
    }
});