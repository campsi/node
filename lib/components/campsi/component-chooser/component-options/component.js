var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/component-chooser/component-options', function ($super) {

    return {

        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {

                Campsi.create('form', undefined, undefined, function (form) {
                    instance.optionsForm = form;
                    instance.nodes.type = $('<div class="component-type"></div>');
                    instance.mountNode.append(instance.nodes.type);
                    instance.mountNode.append(instance.optionsForm.render());
                    next();
                });

            });
        },

        attachEvents: function(){
            this.optionsForm.attachEvents();
        },

        getNodePaths: function(){
            return {
                type: '> .component-type'
            }
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .component.form'), function (optionsForm) {
                    instance.optionsForm = optionsForm;
                    next();
                });
            });
        },

        valueDidChange: function (next) {

            var instance = this;

            if (typeof instance.value === 'undefined' || typeof instance.value.type === 'undefined') {
                instance.optionsForm.setOptions(undefined, function () {
                    next();
                });
                return
            }

            Campsi.get(instance.value.type, function (Component) {
                var componentOptions = Component.prototype.getDesignerFormOptions.call();
                instance.optionsForm.setOptions(componentOptions, function () {
                    instance.optionsForm.setValue(instance.value, function () {
                        instance.nodes.type.text(instance.value.type);
                        next();
                    });
                });
            });
        }
    }
});
