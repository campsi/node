var Campsi = require('campsi-core');

module.exports = Campsi.extend('handlebars', 'campsi/templates/item', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                template: '<a href="{{href}}">{{name}}</a>'
            };
        },

        valueDidChange: function (next) {
            this.value.href = this.context.applicationURL('template', {template: this.value});
            console.info(this.value.href);
            $super.valueDidChange.call(this, next);
        },
        serializeValue: function(){

        }
    }
});