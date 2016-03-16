var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project/users/guest', function ($super) {

    return {


        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.email = $('<div class="email">');
                instance.nodes.roles = $('<div class="roles">');
                instance.mountNode.append(instance.nodes.email);
                instance.mountNode.append(instance.nodes.roles);

                next();
            });
        },

        getNodePaths: function () {
            return {
                email: 'div.email',
                roles: 'div.roles'
            };
        },

        valueDidChange: function (next) {
            this.nodes.email.text(this.value.email);
            next();
        }
    }
});