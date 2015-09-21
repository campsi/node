var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project-list/project', function ($super) {

    return {

        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {

                instance.nodes.logo = $('<div class="logo drag-handle" data-state="projects+project"><img></div>');
                instance.nodes.title = $('<span class="title"></span>');
                instance.mountNode.append(instance.nodes.logo);
                instance.mountNode.append(instance.nodes.title);

                next();
            })
        },

        getNodePaths: function () {
            return {
                logo: '> div.logo',
                title: '> span.title'
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            instance.mountNode.attr('data-id', instance.value.id);
            instance.nodes.logo.find('img').attr('src', instance.value.iconURL);
            instance.nodes.title.text(instance.value.title);

            next();
        }

    }

});