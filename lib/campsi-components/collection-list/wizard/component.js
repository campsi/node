'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'campsi/collection-list/wizard', function ($super) {
    return {
        getDefaultValue: function () {
            return 'empty';
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.context.get('templates', {}, function (templates) {
                    instance.nodes.intro = $('<div class="intro">').html(instance.context.translate('panels.project.collections.wizard.intro'));
                    instance.nodes.templates = $('<div class="templates"></div>');
                    instance.nodes.templates.append(instance.createTemplate({
                        _id: 'empty',
                        identifier: 'empty',
                        name: instance.context.translate('panels.project.templates.empty'),
                        icon: { src: 'https://campsi.imgix.net/56b0f1c85f9e20f80551b670-Vk1M79H1b.png' },
                        selected: true
                    }));
                    templates.forEach(function (t) {
                        instance.nodes.templates.append(instance.createTemplate(t));
                    });
                    instance.mountNode.append(instance.nodes.intro);
                    instance.mountNode.append(instance.nodes.templates);
                    next();
                });
            });
        },
        getNodePaths: function () {
            return { templates: '.templates' };
        },
        attachEvents: function () {
            var instance = this;
            instance.nodes.templates.on('change', 'input', function () {
                var $input = $(this);
                instance.setValue($input.val(), function () {
                    instance.nodes.templates.find('label').removeClass('selected');
                    $input.closest('label').addClass('selected');
                });
            });
        },
        createTemplate: function (template) {
            var $template = $('<label class="template">' + '     <input type="radio"/>' + '     <span class="icon"></span>' + '     <span class="name"></span>' + '</label>');
            $template.find('input').attr({
                value: template._id,
                name: this.id
            });
            $template.find('.name').text(template.name);
            if (template.icon && template.icon.src) {
                $template.find('.icon').css('background-image', 'url(' + template.icon.src + '?w=100)');
            }
            if (template.selected) {
                $template.addClass('selected');
                $template.find('input').attr('checked', true);
            }
            this.nodes.templates.append($template);
        }
    };
});