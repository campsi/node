var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-list/wizard', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                templates: [{
                    name: 'empty',
                    icon: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/file-empty-128.png',
                    selected: true,
                    empty: true
                }, {
                    name: 'news',
                    icon: 'https://cdn0.iconfinder.com/data/icons/flat-color-icons/504/news-128.png'
                }]
            }
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.title = $('<h4>').text('Create a new collection');
                instance.nodes.description = $('<p>').text('Create a collection from scratch or select a template');
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
                instance.value = $(this).val();
                instance.nodes.templates.find('label').removeClass('selected');
                $(this).closest('label').addClass('selected');
                instance.trigger('change');
            });
        },

        createTemplate: function (template) {

            var $template = $('<label class="template">' +
                              '     <input type="radio"/>' +
                              '     <span class="icon"></span>' +
                              '     <span class="name"></span>' +
                              '</label>');

            $template.find('input').attr({value: template.name, name: this._id});
            $template.find('.name').text(template.name);
            $template.find('.icon').css('background-image', 'url(' + template.icon + ')');
            if (template.selected) {
                $template.addClass('selected');
                $template.find('input').attr('checked', true);
            }
            this.nodes.templates.append($template);
        },

        optionsDidChange: function (next) {
            this.nodes.templates.empty();
            this.options.templates.forEach(function (template) {
                this.createTemplate(template);
            }, this);

            this.mountNode.append('<div class="clear"></div>');

            next();
        }
    }
});