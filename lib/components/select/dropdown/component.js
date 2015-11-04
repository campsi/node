var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'select/dropdown', function ($super) {
    return {

        getDefaultOptions: function () {
            return {
                createEmptyOption: true,
                options: []
            }
        },
        getTagName: function () {
            return 'select';
        },

        getDesignerFormOptions: function () {
            var superOptions = $super.getDesignerFormOptions.call(this);

            superOptions.fields = superOptions.fields.concat([{
                name: 'options',
                label: 'options',
                type: 'array',
                additionalClasses: ['dropdown-options'],
                newItemLabel: '+',
                items: {
                    type: 'form', // todo replace by hash when it's done
                    fields: [{
                        name: 'value',
                        type: 'text',
                        placeholder: 'value'
                    }, {
                        name: 'label',
                        type: 'text',
                        placeholder: 'label'
                    }]
                }
            }]);
            return superOptions;

        },

        attachEvents: function () {
            var instance = this;
            this.mountNode.on('change', function () {
                instance.value = instance.mountNode.val();
                instance.trigger('change');
            });
        },

        optionsDidChange: function (next) {
            this.mountNode.empty();
            if (this.options.createEmptyOption) {
                this.mountNode.append('<option selected></option>');
            }
            this.options.options.forEach(function (opt) {
                var $opt = this.createOption(opt.value, opt.label);
                this.mountNode.append($opt);
            }, this);
            next();
        },

        createOption: function (value, label) {
            var $option = $('<option>');
            $option.attr('value', value);
            $option.text(label);
            return $option;
        },

        valueDidChange: function (next) {
            this.mountNode.val(this.value);
            next();
        }

    }
});