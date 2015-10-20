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
                            items: {type: 'campsi/project/users/user'},
                            additionalClasses: ['user-list']
                        }, undefined, function (comp) {
                            instance.list = comp;
                            cb();
                        })
                    },
                    function (cb) {
                        Campsi.create('form', {
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
                                            label: 'admin',
                                            help: 'user can create and publish content'
                                        }, {
                                            type: 'checkbox',
                                            name: 'designer',
                                            label: 'designer',
                                            help: 'user can create collections'
                                        }
                                    ]
                                }
                            ], additionalClasses: ['invitation']
                        }, undefined, function (comp) {
                            instance.invitationForm = comp;
                            cb();
                        })
                    }

                ], function () {
                    instance.mountNode.append(instance.list.render());
                    instance.nodes.form.append(instance.invitationForm.render());
                    instance.nodes.form.append($('<button>').text('invite'));
                    instance.mountNode.append('<h3>Invite someone</h3>');
                    instance.mountNode.append(instance.nodes.form);
                    next();
                });

            });
        },

        valueDidChange: function (next) {

            var users = {};
            var usersArr = [];
            var id;

            if (this.value.designers) {

                this.value.designers.forEach(function (u) {
                    users[u._id.toString()] = u;
                    users[u._id.toString()].designer = true;
                });
            }

            if (this.value.admins) {

                this.value.admins.forEach(function (u) {
                    if (typeof users[u._id.toString()] === 'undefined') {
                        users[u._id.toString()] = u;
                    }
                    users[u._id.toString()].admin = true;
                });
            }

            for (id in users) {
                usersArr.push(users[id]);
            }

            this.list.setValue(usersArr, next);
        },
        wakeUp: function (el, next) {
            var instance = this;

            $super.wakeUp.call(this, el, function () {
                async.parallel([
                    function (cb) {
                        Campsi.wakeUp(instance.mountNode.find('.user-list')[0], function (list) {
                            instance.list = list;
                            cb();
                        })
                    }, function (cb) {
                        Campsi.wakeUp(instance.mountNode.find('form > .form')[0], function (form) {
                            instance.invitationForm = form;
                            cb();
                        })
                    }
                ], next);
            });
        },

        attachEvents: function () {
            this.list.attachEvents();
            this.invitationForm.attachEvents();
            this.mountNode.find('form').on('submit', this.sendInvitation.bind(this))
        },

        sendInvitation: function () {

            var data = {
                email: this.invitationForm.value.email,
                roles: []
            };

            if (this.invitationForm.value.roles.admin) {
                data.roles.push('admin');
            }
            if (this.invitationForm.value.roles.designer) {
                data.roles.push('designer');
            }

            $.ajax({
                url: '/api/v1/projects/' + this.value._id + '/invitation',
                data: JSON.stringify(data),
                method: 'POST',
                contentType: 'application/json'
            }).done(function (data) {
                console.info('invitation sent', data)
            }).error(function () {
                console.info('invitation error');
            });

            return false;
        },


        serializeOptions: function () {
        }
    }
});