var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/entry-list/entry', function ($super) {

    return {

        getTagName: function () {
            return 'a';
        },

        getDefaultOptions: function () {
            return {template: '<h4 class="title">{{_id}}</h4>'}
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('handlebars', {}, {}, function (comp) {
                    instance.template = comp;
                    instance.mountNode.append(comp.render()).addClass('drag-handle');
                    next();
                });
            })
        },
        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .component.handlebars'), function (comp) {
                    instance.template = comp;
                    next();
                });
            });
        },
        valueDidChange: function (next) {

            this.mountNode.attr('href', this.value.__collectionUrl + '/' + this.value._id);

            this.template.setValue(this.value, next);
        },

        optionsDidChange: function (next) {
            this.template.setOptions(this.options, next);
        },

        serializeOptions: function () {
            return {
                __project: this.__project,
                _id: this._id,
                identifier: this.identifier
            }
        },

        serializeValue: function () {
            return {_id: this.value._id};
        }
    }
});