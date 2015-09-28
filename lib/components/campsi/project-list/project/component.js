var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project-list/project', function ($super) {

    return {

        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {

                instance.nodes.logo = $('<a href="/projects/new" class="logo drag-handle"></a>');
                instance.nodes.title = $('<span class="title"></span>');
                instance.mountNode.append(instance.nodes.logo);
                instance.mountNode.append(instance.nodes.title);

                next();
            })
        },

        getNodePaths: function () {
            return {
                logo: '> a.logo',
                title: '> span.title'
            }
        },

        valueDidChange: function (next) {
            var instance = this;

            instance.mountNode.attr('data-id', instance.value._id);
            instance.nodes.logo.attr('href', '/projects/' + instance.value._id);
            if (typeof instance.value.icon !== 'undefined') {
                instance.nodes.logo.css('background-image', 'url(' + instance.value.icon.uri + ')');
            }
            instance.nodes.title.text(instance.value.title);

            next();
        }

    }

});