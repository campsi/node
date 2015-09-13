var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'form/field', function ($super) {

    return {

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'label': '> div.label',
                'control': '> div.control',
                'errors': '> div.errors',
                'help': '> div.help'
            });
        },

        getDesignerFormOptions: function () {

            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'label',
                label: 'label',
                type: 'form/text',
                additionalClasses: ['form-field-label']
            }, {
                name: 'name',
                label: 'field name',
                type: 'form/text',
                additionalClasses: ['form-field-name']
            }/*, {
             name: 'required',
             label: 'required',
             type: 'form/checkbox',
             additionalClasses: ['form-field-required']
             }*/
            ]);
            return superOptions;

        },

        init: function (next) {

            $super.init.call(this, function () {

                this.nodes.label = $('<div class="label">');
                this.nodes.control = $('<div class="control">');
                this.nodes.errors = $('<div class="errors">');
                this.nodes.help = $('<div class="help">');

                this.mountNode
                    .append(this.nodes.label)
                    .append(this.nodes.control)
                    .append(this.nodes.errors)
                    .append(this.nodes.help);

                if (next) next.call(this);
            });
        },

        optionsDidChange: function (next) {
            if (this.options.label) {
                this.nodes.label.text(this.options.label);
            } else {
                this.nodes.label.text('').css('display', 'none');
            }

            if (next) next.call(this);
        },

        valueDidChange: function (next) {
            next.call(this);
        }
    }
});