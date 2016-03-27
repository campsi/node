var Campsi = require('campsi-core');

module.exports = Campsi.extend('component', 'campsi/support', function ($super) {

    return {

        getContactFormOptions: function(){
            var t = this.context.translate.bind(this.context);
            return {
                fields: [{
                    name: 'email',
                    type: 'text',
                    label: t('component.support.form.email.label')
                }, {
                    name: ''
                }]
            }
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('form', {context: instance.context, options: instance.getContactFormOptions()}, function(form){

                });
                next();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                next();
            })
        },

        getNodePaths: function () {
            return {};
        },

        optionsDidChange: function (next) {
            next();
        },

        valueDidChange: function (next) {
            next();
        }
    }
});