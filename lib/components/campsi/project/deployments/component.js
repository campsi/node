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
                            label: 'Connection',
                            type: 'select/dropdown',
                            options: [{
                                value: 'FTP',
                                label: 'FTP'
                            }, {
                                value: 'EMAIL',
                                label: 'Email'
                            }]
                        }, {
                            type: 'form',
                            name: 'email',
                            label: 'email',
                            visible: '{../fields/connection/value} == "EMAIL"',
                            fields: [{
                                type: 'text',
                                name: 'value',
                                label: 'Email address'
                            }, {
                                type: 'select/dropdown',
                                name: 'frequency',
                                options: [{
                                    value: 'sync',
                                    label: 'Sync'
                                }, {
                                    value: '1d',
                                    label: 'daily'
                                }]
                            }]
                        }, {
                            type: 'form',
                            name: 'ftpConfig',
                            visible: '{../fields/connection/value} == "FTP"',
                            fields: [{
                                label: 'host',
                                name: 'host',
                                type: 'text'

                            }, {
                                label: 'port',
                                name: 'port',
                                type: 'number',
                                integer: true
                            }, {
                                label: 'username',
                                name: 'username',
                                type: 'text'
                            }, {
                                label: 'password',
                                name: 'password',
                                type: 'text/password'
                            }, {
                                label: 'path',
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