var Campsi = require('campsi-core');
var async = require('async');

module.exports = Campsi.extend('component', 'campsi/dashboard', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                widgets: [{
                    type: 'campsi/dashboard/widget/profile'
                }, {
                    type: 'campsi/dashboard/widget/activity'
                }, {
                    type: 'campsi/dashboard/widget/favorites'
                }, {
                    type: 'campsi/dashboard/widget/news'
                }]
            }
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            instance.widgets = [];
            $super.wakeUp.call(instance, el, context, function () {
                async.forEach(instance.mountNode.find('.campsi_dashboard_widget'), function (widgetEl, cb) {
                    Campsi.wakeUp(widgetEl, context, function (widget) {
                        instance.widgets.push(widget);
                        cb();
                    });
                }, function(){
                    next()
                });
            });
        },

        attachEvents: function () {
            this.widgets.forEach(function (widget) {
                widget.attachEvents();
            });
        },

        optionsDidChange: function (next) {
            var instance = this;
            instance.widgets = [];
            async.forEachOf(this.options.widgets, function eachWidget(widgetOptions, index, cb) {
                Campsi.create(widgetOptions.type, {
                    options: widgetOptions,
                    context: instance.context
                }, function (widget) {
                    instance.widgets[index] = widget;
                    cb();
                })
            }, function allWidgetsCreated() {
                instance.widgets.forEach(function(widget){
                    instance.mountNode.append(widget.render());
                });
                next();
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            async.forEach(instance.widgets, function eachWidget(widget, cb) {
                widget.setValue(instance.value, cb)
            }, function allWidgetsSetValue() {
                next();
            })
        }
    }
});