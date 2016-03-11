var Campsi = require('campsi-core');
var async = require('async');
var extend = require('extend');

module.exports = Campsi.extend('component', 'layout/divider', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                sections: []
            };
        },

        getDesignerFormOptions: function () {
            return {
                fields: [{
                    name: 'sections',
                    label: 'sections',
                    type: 'array',
                    items: {
                        type: 'form',
                        fields: [{
                            name: 'name',
                            label: 'section name',
                            type: 'text'
                        }, {
                            name: 'component',
                            label: 'component',
                            type: 'campsi/component-chooser'
                        }]
                    }
                }]
            };
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
            var instance = this;
            instance.sections = instance.sections || [];

            async.forEach(this.options.sections, function (section, cb) {
                Campsi.create(section.type, {
                    options: section.componentOptions,
                    context: instance.context
                }, function (comp) {
                    instance.sections.push(extend({}, section, {component: comp}));
                    cb();
                });

            }, function () {
                next();
            });

        },

        valueDidChange: function (next) {
            next();
        }
    }
});