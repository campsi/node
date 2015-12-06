var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/project/deployments', function ($super) {

    return {

        save: function () {
            var instance = this;
            $.ajax({
                method: 'PUT',
                url: this.context.apiURL('project'),
                data: JSON.stringify(this.value),
                contentType: 'application/json'
            }).done(function () {
                instance.trigger('saved');
            });
        },
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'deployments',
                    type: 'array',
                    items: {
                        type: 'form',
                        fields: [{
                            name: 'connection',
                            label: this.context.translate('panels.projectDeployments.fields.connection'),
                            type: 'select/dropdown',
                            options: [{
                                value: 'FTP',
                                label: this.context.translate('panels.projectDeployments.fields.connection.ftp')
                            }, {
                                value: 'EMAIL',
                                label: this.context.translate('panels.projectDeployments.fields.connection.email')
                            }]
                        }, {
                            type: 'form',
                            name: 'email',
                            visible: '{../fields/connection/value} == "EMAIL"',
                            fields: [{
                                type: 'text',
                                name: 'value',
                                label: this.context.translate('panels.projectDeployments.fields.email'),
                            }, {
                                type: 'select/dropdown',
                                name: 'frequency',
                                options: [{
                                    value: 'sync',
                                    label: this.context.translate('panels.projectDeployments.fields.email.frequency.synchronous')
                                }, {
                                    value: '1d',
                                    label: this.context.translate('panels.projectDeployments.fields.email.frequency.daily')
                                }]
                            }]
                        }, {
                            type: 'form',
                            name: 'ftpConfig',
                            visible: '{../fields/connection/value} == "FTP"',
                            fields: [{
                                label: this.context.translate('panels.projectDeployments.fields.ftp.host'),
                                name: 'host',
                                type: 'text'

                            }, {
                                label: this.context.translate('panels.projectDeployments.fields.ftp.port'),
                                name: 'port',
                                type: 'number',
                                integer: true
                            }, {
                                label: this.context.translate('panels.projectDeployments.fields.ftp.username'),
                                name: 'username',
                                type: 'text'
                            }, {
                                label: this.context.translate('panels.projectDeployments.fields.ftp.password'),
                                name: 'password',
                                type: 'text/password'
                            }, {
                                label: this.context.translate('panels.projectDeployments.fields.ftp.path'),
                                name: 'path',
                                type: 'text'
                            }]
                        }]
                    }
                }]
            }
        }
    }

});