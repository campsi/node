var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project/users/user', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.avatar = $('<span class="avatar"><img></span>');
                instance.nodes.name = $('<p class="name"></p>');
                instance.nodes.username = $('<span class="username">');
                instance.nodes.company = $('<span class="company">');
                instance.nodes.roles = $('<p class="roles"></p>');

                instance.mountNode.append([
                    instance.nodes.avatar,
                    instance.nodes.name,
                    instance.nodes.username,
                    instance.nodes.company,
                    instance.nodes.roles
                ]);
                next();
            });
        },

        getDefautValue: function () {
            return {
                name: '',
                username: '',
                picture: {},
                company: ''
            }
        },

        getNodePaths: function () {
            return {
                avatar: '.avatar',
                name: '.name',
                username: '.username',
                company: '.company',
                roles: '.company'
            }
        },

        valueDidChange: function (next) {

            if(typeof this.value === 'undefined'){
                return next();
            }

            if (typeof this.value.avatar !== 'undefined' && this.value.avatar.uri) {
                this.nodes.avatar.find('img').attr('src', this.value.avatar.uri + '?w=100&h=100&fit=clamp');
            } else {
                this.nodes.avatar.find('img').attr('src', 'http://campsi.imgix.net/56261291c0e9425a0b9404d8-NJtzgitMx.png?w=100&h=100&fit=clamp')
            }

            var $roles = this.nodes.roles.empty();
            this.value.projectRoles.forEach(function(role){
                $roles.append($('<span>').text(role));
            });

            this.nodes.name.text(this.value.fullname || this.value.displayName);
            this.nodes.username.text(this.value.nickname);
            this.nodes.company.text(this.value.company);
            next();
        }
    }
});