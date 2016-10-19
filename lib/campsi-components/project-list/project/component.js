'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'campsi/project-list/project', function ($super) {
    return {
        getTagName: function () {
            return 'a';
        },
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.mountNode.attr('href', '/projects/new');
                instance.nodes.logo = $('<div class="logo"><img></div>');
                instance.nodes.infos = $('<div class="infos">');
                instance.nodes.title = $('<span class="title"></span>');
                instance.nodes.title.text(instance.context.translate('panels.projects.newProjectLabel'));
                instance.mountNode.append(instance.nodes.logo);
                instance.nodes.infos.append(instance.nodes.title);
                instance.mountNode.append(instance.nodes.infos);
                next();
            });
        },
        getNodePaths: function () {
            return {
                logo: '.logo',
                title: 'span.title',
                infos: '.infos'
            };
        },
        valueDidChange: function (next) {
            var instance = this;
            if (typeof instance.value === 'undefined') {
                return next();
            }
            var $img = instance.nodes.logo.find('img');
            var hasIcon = instance.value.icon && instance.value.icon.src;
            instance.mountNode.attr('href', instance.context.applicationURL('project', { project: instance.value }));
            if (hasIcon) {
                $img.attr('src', instance.value.icon.src + '?h=160&fit=fill&bg=0FFF&fm=png');
            } else {
                $img.attr('src', 'https://campsi.imgix.net/56b0f1c85f9e20f80551b670-NJ9JFeZCx.png?h=200&w=200');
            }
            instance.mountNode.toggleClass('demo', instance.value.demo === true);
            instance.mountNode.toggleClass('has-icon', hasIcon);
            instance.nodes.title.text(instance.value.title);
            next();
        },
        serializeValue: new Function(),
        serializeOptions: new Function()
    };
});