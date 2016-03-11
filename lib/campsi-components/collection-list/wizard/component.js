var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-list/wizard', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                templates: []
            }
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.title = $('<h4>').text(instance.context.translate('panels.project.wizard.title'));
                instance.nodes.description = $('<p>').text(instance.context.translate('panels.project.wizard.description'));
                instance.nodes.templates = $('<div class="templates"></div>');
                instance.mountNode.append(instance.nodes.title);
                instance.mountNode.append(instance.nodes.description);
                instance.mountNode.append(instance.nodes.templates);
                next();
            });
        },

        getNodePaths: function () {
            return {
                templates: '.templates',
                title: 'h4',
                description: 'p'
            }
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.templates.on('change', 'input', function () {
                var $input = $(this);
                instance.setValue($input, function () {
                    instance.nodes.templates.find('label').removeClass('selected');
                    $input.closest('label').addClass('selected');
                });
            });
        },

        createTemplate: function (template) {

            var $template = $('<label class="template">' +
                '     <input type="radio"/>' +
                '     <span class="icon"></span>' +
                '     <span class="name"></span>' +
                '</label>');

            $template.find('input').attr({value: template.identifier, name: this.id});
            $template.find('.name').text(template.name);

            if (template.icon && template.icon.uri) {
                $template.find('.icon').css('background-image', 'url(' + template.icon.uri + '?w=100)');
            }

            if (template.selected) {
                $template.addClass('selected');
                $template.find('input').attr('checked', true);
            }
            this.nodes.templates.append($template);
        },

        optionsDidChange: function (next) {


            this.nodes.templates.empty();
            this.createTemplate({
                name: 'empty',
                identifier: 'empty',
                icon: {uri: 'http://campsi.imgix.net/56261291c0e9425a0b9404d8-E1jBz7Oze.png'},
                selected: true
            });
            this.options.templates.forEach(function (template) {
                this.createTemplate(template);
            }, this);

            this.mountNode.append('<div class="clear"></div>');

            next();
        }
    }
});