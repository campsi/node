var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project-list/project', function ($super) {

    return {

        getTagName: function(){
            return 'a';
        },

        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {

                instance.mountNode.attr('href', '/projects/new');

                instance.nodes.logo = $('<div class="logo"></div>');
                instance.nodes.title = $('<span class="title"></span>');
                instance.nodes.title.text(instance.context.translate('panels.projects.newProjectLabel'))

                var $wrapper = $('<div class="wrapper"><div class="spacer"></div></div>');
                $wrapper.append(instance.nodes.logo);

                instance.mountNode.append($wrapper);
                instance.mountNode.append(instance.nodes.title);

                next();
            })
        },

        getNodePaths: function () {
            return {
                logo: '.logo',
                title: 'span.title'
            }
        },

        valueDidChange: function (next) {
            var instance = this;

            if(typeof instance.value === 'undefined'){
                return next();
            }

            instance.mountNode.attr('href', instance.context.applicationURL('project', {project: instance.value}));
            if (instance.value.icon && instance.value.icon.uri) {
                instance.nodes.logo.css('background-image', 'url(' + instance.value.icon.uri + ')');
            }
            instance.mountNode.toggleClass('demo', instance.value.demo === true);
            instance.nodes.title.text(instance.value.title);
            next();
        }
    }

});