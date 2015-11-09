var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var handlebars = require('handlebars');

module.exports = Campsi.extend('component', 'campsi/entries-and-drafts/item', function ($super) {

    return {
        getTagName: function () {
            return 'div';
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.mountNode.append($('<a class="main">'));
                instance.mountNode.append($('<a class="rel">'));
                next();
            })
        },

        attachEvents: function(){
            $super.attachEvents.call(this);
            this.mountNode.find('a').on('click', function(){
                $(this).addClass('active');
            })
        },

        getTemplate: function () {
            var template = '<h4>{{data.title}}</h4>';
            this.context.get('collection', function (c) {
                c.templates.forEach(function (t) {
                    if (t.scope === 'entry' && t.identifier === 'entry') {
                        template = t.markup;
                    }
                });
            });
            return handlebars.compile(template)(this.value);
        },

        valueDidChange: function (next) {
            this.mountNode.find('> .main')
                .append($('<div class="template">').html(this.getTemplate()))
                .append($('<span class="id">').text(this.value._id.toString()));

            var resourceType = (this.value.draft === true) ? 'draft' : 'entry';
            var params = {};
            params[resourceType] = this.value;
            this.mountNode.find('> .main')
                .toggleClass('drag-handle', resourceType === 'entry')
                .attr('href', this.context.applicationURL(resourceType, params));

            if (this.value._entry) {
                this.mountNode.find('> .rel')
                    .attr('href', this.context.applicationURL('entry', {entry: this.value._entry}))
                    .html('<i class="fa fa-link"></i> see published')
                    .removeClass('hidden');
            } else if (this.value.draft && resourceType == 'entry') {
                this.mountNode.find('> .rel')
                    .attr('href', this.context.applicationURL('draft', {draft: this.value.draft}))
                    .html('<i class="fa fa-link"></i> see draft')
                    .removeClass('hidden');
            } else {
                this.mountNode.find('> .rel').empty().addClass('hidden');
            }
            next();
        }
    }
});