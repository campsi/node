var Campsi = require('campsi-core');
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
                instance.nodes.logo = $('<div class="logo"><img width="200" height="200"></div>');
                instance.nodes.title = $('<span class="title"></span>');
                instance.nodes.title.text(instance.context.translate('panels.projects.newProjectLabel'));

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

            var $img = instance.nodes.logo.find('img');
            var hasIcon = (instance.value.icon && instance.value.icon.src);

            instance.mountNode.attr('href', instance.context.applicationURL('project', {project: instance.value}));

            if (hasIcon) {
                $img.attr('src', instance.value.icon.src + '?w=200&h=200&fit=fill&bg=0FFF&fm=png');
            }

            instance.mountNode.toggleClass('demo', instance.value.demo === true);
            instance.mountNode.toggleClass('has-icon', hasIcon);
            instance.nodes.title.text(instance.value.title);
            next();
        },

        serializeValue: new Function(),
        serializeOptions: new Function()
    }

});