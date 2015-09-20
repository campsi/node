var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

Campsi.extend('component', 'campsi/user-list/user', function ($super) {

    return {

        getDefaultValue: function(){
            return {
                name: 'Add user',
                picture: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/128/user.png'
            }
        },

        init: function (next) {

            var instance = this;
            var defaultValue = this.getDefaultValue();
            $super.init.call(this, function () {

                instance.nodes.image = $('<img>').attr('src', defaultValue.picture);
                instance.nodes.avatar = $('<div class="avatar drag-handle"></div>');
                instance.nodes.avatar.append(this.nodes.image);
                instance.nodes.name = $('<div class="name"></div>').text(defaultValue.name);
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
                console.info(instance.value);
                instance.nodes.image.attr('src', instance.value.picture);
                instance.nodes.name.text(instance.value.name);
                next.call();
            });

        }
    }
});