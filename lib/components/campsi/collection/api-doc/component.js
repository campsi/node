var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection/api-doc', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.append($('<h3>').text(instance.context.translate('panels.collection.api-doc.title')));
                instance.mountNode.append(instance.context.translate('panels.collection.api-doc.content'));
                Campsi.create('text', {context: instance.context, options: {disabled: true}}, function (textComponent) {
                    instance.textComponent = textComponent;
                    instance.mountNode.append($('<p>').append(instance.textComponent.render()))
                    instance.mountNode.append(instance.context.translate('panels.collection.api-doc.content.after'));

                });
                next();
            })
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('.component.text'), context, function (textComponent) {
                    instance.textComponent = textComponent;
                    next();
                });
            });
        },

        valueDidChange: function (next) {
            this.textComponent.setValue(this.value, next);
        }


    }
});