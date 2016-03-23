var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var async = require('async');

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

                Campsi.get('form', function (FormComponent) {
                    instance.FormComponent = FormComponent;
                    next();
                });
            })
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                Campsi.get('form', function (FormComponent) {
                    instance.FormComponent = FormComponent;
                    next();
                });
            });
        },

        attachEvents: function () {
            $super.attachEvents.call(this);
            this.mountNode.find('a').on('click', function () {
                $(this).addClass('active');
            })
        },

        valueDidChange: function (next) {

            var instance = this;
            instance.context.get('collection', function (collection) {
                instance.FormComponent.prototype.getHtml(instance.value.data, collection, function(html){
                    instance.mountNode.find('> .main')
                        .empty()
                        .append(html)
                        .append($('<span class="id">').text(instance.value._id.toString()));

                    var resourceType = (instance.value.draft === true) ? 'draft' : 'entry';
                    var params = {};
                    params[resourceType] = instance.value;
                    instance.mountNode.find('> .main')
                        .toggleClass('drag-handle', resourceType === 'entry')
                        .attr('href', instance.context.applicationURL(resourceType, params));

                    if (instance.value._entry) {
                        instance.mountNode.find('> .rel')
                            .attr('href', instance.context.applicationURL('entry', {entry: instance.value._entry}))
                            .html('<i class="fa fa-link"></i> ' + instance.context.translate('panels.entriesAndDrafts.seePublished'))
                            .removeClass('hidden');
                    } else if (instance.value.draft && resourceType === 'entry') {
                        instance.mountNode.find('> .rel')
                            .attr('href', instance.context.applicationURL('draft', {draft: instance.value.draft}))
                            .html('<i class="fa fa-link"></i> ' + instance.context.translate('panels.entriesAndDrafts.seeDraft'))
                            .removeClass('hidden');
                    } else {
                        instance.mountNode.find('> .rel').empty().addClass('hidden');
                    }
                    next();
                });
            });
        }
    }
});