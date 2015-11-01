var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var context = require('app-context')();

module.exports = Campsi.extend('component', 'campsi/entry-list/entry', function ($super) {

    return {

        getTagName: function () {
            return 'a';
        },


        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('handlebars', {context: instance.context}, function (comp) {
                    instance.template = comp;
                    instance.mountNode.append(comp.render()).addClass('drag-handle');
                    next();
                });
            })
        },
        wakeUp: function (el, context,next) {
            var instance = this;
            $super.wakeUp.call(this, el, context,function () {
                Campsi.wakeUp(instance.mountNode.find('> .component.handlebars'), context, function (comp) {
                    instance.template = comp;
                    next();
                });
            });
        },
        valueDidChange: function (next) {
            var url = [];

            url.push('/projects');
            url.push(this.context._project.identifier || this.context._project._id);
            url.push('collections');
            url.push(this.context._collection.identifier || this.context._collection._id);
            if (this.value.draft) {
                url.push('drafts');
                url.push((this.value.draft === true) ? this.value._id : this.value.draft._id);
            } else {
                url.push('entries');
                url.push(this.value._id);
            }
            this.mountNode.attr('href', url.join('/'));
            this.mountNode.toggleClass('draft', (typeof this.value.draft !== 'undefined'));

            var entryTemplate = '<h4 class="title">{{_id}}</h4>';

            this.context._collection.templates.forEach(function (t) {
                if (t.identifier === 'entry') {
                    entryTemplate = t.markup;
                }
            });

            var instance = this;
            this.template.setOptions({template: entryTemplate}, function () {
                instance.template.setValue(instance.value, next);
            });
        },

        optionsDidChange: function (next) {
            this.template.setOptions(this.options, next);
        },

        serializeOptions: function () {
        },

        serializeValue: function () {
            return this.value._id.toString();
        }
    }
});