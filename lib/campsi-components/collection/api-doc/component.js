var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection/api-doc', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.append($('<h3>').text(instance.context.translate('panels.collection.api-doc.title')));
                instance.mountNode.append(instance.context.translate('panels.collection.api-doc.content'));
                Campsi.create('url', {context: instance.context}, function (urlComponent) {
                    instance.urlComponent = urlComponent;
                    instance.mountNode.append($('<p>').append(instance.urlComponent.render()));
                    instance.mountNode.append(instance.context.translate('panels.collection.api-doc.content.after'));
                    Campsi.create('campsi/sdk/js', {context: instance.context}, function (sdkJsComponent) {
                        instance.sdkJsComponent = sdkJsComponent;
                        instance.mountNode.append(instance.sdkJsComponent.render());
                        next();
                    });
                });
            })
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('.component.url'), context, function (textComponent) {
                    instance.urlComponent = textComponent;
                    Campsi.wakeUp(instance.mountNode.find('.component.campsi_sdk_js'), context, function (sdkJsComponent) {
                        instance.sdkJsComponent = sdkJsComponent;
                        next();
                    });
                });
            });
        },

        valueDidChange: function (next) {
            var instance = this;

            if (typeof this.value._id === 'undefined') {
                return next();
            }

            var url = instance.context.apiURL('entries');
            this.urlComponent.setValue(url, function () {
                instance.sdkJsComponent.setValue(instance.value, next);
            });
        }


    }
});