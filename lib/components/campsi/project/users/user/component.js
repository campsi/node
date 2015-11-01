var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project/users/user', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.avatar = $('<img class="avatar">');
                instance.nodes.name = $('<span class="name">');
                instance.nodes.username = $('<span class="username">');
                instance.nodes.company = $('<span class="company">');

                instance.mountNode.append([
                    instance.nodes.avatar,
                    instance.nodes.name,
                    instance.nodes.username,
                    instance.nodes.company
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
                company: 'company'
            }
        },

        valueDidChange: function (next) {

            if(typeof this.value === 'undefined'){
                return next();
            }

            if (typeof this.value.avatar !== 'undefined' && this.value.avatar.uri) {
                this.nodes.avatar.attr('src', this.value.avatar.uri + '?w=60&h=60');
            }

            this.nodes.name.text(this.value.nickname);
            this.nodes.username.text(this.value.username);
            this.nodes.company.text(this.value.company);
            next();
        }
    }
});