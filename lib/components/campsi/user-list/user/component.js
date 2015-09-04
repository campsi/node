var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/user-list/user', function ($super) {

    return {
        init: function (next) {

            var instance = this;
            $super.init.call(this, function () {
                instance.nodes.image = $('<img>');
                instance.nodes.avatar = $('<div class="avatar"></div>');
                instance.nodes.avatar.append(this.nodes.image);
                instance.nodes.name = $('<div class="name"></div>');
                instance.mountNode.append(instance.nodes.avatar);
                instance.mountNode.append(instance.nodes.name);
                next.call();
            });
        },

        getNodePaths: function () {
            return {
                avatar: '> .avatar',
                image: '> .avatar > img',
                name: '> .name'
            }
        },

        valueDidChange: function (next) {

            var instance = this;
            $super.valueDidChange.call(this, function () {
                instance.nodes.image.attr('src', instance.value.picture);
                instance.nodes.name.text(instance.value.name);
                next.call();
            });

        }
    }
});