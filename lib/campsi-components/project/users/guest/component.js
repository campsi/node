'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var config = require('../../../../../browser-config');
module.exports = Campsi.extend('component', 'campsi/project/users/guest', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.email = $('<div class="email">');
                instance.nodes.roles = $('<div class="roles">');
                instance.nodes.link = $('<div class="link"><label><i class="fa fa-link"></i><span></span></label><input type="text" disabled></div>');
                instance.nodes.link.find('label span').text(instance.context.translate('panels.projectUsers.guest.invitationLink.label'));
                instance.mountNode.append(instance.nodes.email);
                instance.mountNode.append(instance.nodes.roles);
                instance.mountNode.append(instance.nodes.link);
                next();
            });
        },
        getNodePaths: function () {
            return {
                email: 'div.email',
                roles: 'div.roles',
                link: 'div.link'
            };
        },
        valueDidChange: function (next) {
            this.nodes.email.text(this.value.email);
            this.nodes.link.find('input').val(config.host + '/invitation/' + this.value._id);
            var $roles = this.nodes.roles.empty();
            console.info(this.value.projectRoles);
            this.value.projectRoles.forEach(function (role) {
                $roles.append($('<span>').text(role));
            });
            next();
        }
    };
});