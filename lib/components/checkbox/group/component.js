var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var deepCopy = require('deepcopy');
var noop = function(){

};

module.exports = Campsi.extend('component', 'checkbox/group', function ($super) {

    return {

        getDefaultValue: function () {
            return [];
        },

        getDefaultOptions: function () {
            return {
                options: []
            }
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

        createOption: function (option, cb) {
            var instance = this;
            Campsi.create('checkbox', {
                options: {label: option.label},
                context: this.context
            }, function (checkboxComponent) {
                instance.checkboxes[option.value] = checkboxComponent;
                checkboxComponent.mountNode.attr('data-checkbox-value', option.value);
                instance.mountNode.append(checkboxComponent.render());
                cb();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            instance.checkboxes = {};

            $super.wakeUp.call(this, el, context, function () {
                var checkboxesEls = this.mountNode.find('.checkbox').toArray();
                async.forEach(checkboxesEls, function (chkEl, cb) {
                    Campsi.wakeUp(chkEl, context, function (component) {
                        instance.checkboxes[$(chkEl).data('checkbox-value').toString()] = component;
                        cb();
                    })
                }, next)
            });
        },

        attachEvents: function () {
            var instance = this;
            for (var name in this.checkboxes) {
                if (this.checkboxes.hasOwnProperty(name)) {
                    this.checkboxes[name].attachEvents();
                    this.checkboxes[name].bind('change', function () {
                        var newValue = deepCopy(instance.value);
                        var chkValue = this.mountNode.data('checkbox-value');
                        var itemIndex = instance.value.indexOf(chkValue);
                        if (this.value && itemIndex === -1) {
                            newValue.push(chkValue.toString());
                        } else if (itemIndex > -1) {
                            newValue.splice(itemIndex, 1);
                        }
                        instance.setValue(newValue);
                    });
                }
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            var item;
            for (item in instance.checkboxes) {
                if (instance.checkboxes.hasOwnProperty(item)) {
                    instance.checkboxes[item].setValue(instance.value.indexOf(item.toString()) > -1, noop, false)
                }
            }
            next();
        },
        optionsDidChange: function (next) {

            var instance = this;
            this.mountNode.empty();
            this.checkboxes = {};
            async.forEach(this.options.options, function (option, cb) {
                instance.createOption(option, cb);
            }, next);
        }
    }

});