var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project/users/user', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.avatar = $('<div class="avatar">');
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

        resolveParam: function (param) {
            if (param === 'project') {
                return this.value.identifier || this.value._id;
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

            if (this.value.picture.uri) {
                this.nodes.avatar.css('background-image', 'url(' + this.value.picture.uri + ')');
            }

            this.nodes.name.text(this.value.nickname);
            this.nodes.username.text(this.value.username);
            this.nodes.company.text(this.value.company);
            next();
        }
    }
});