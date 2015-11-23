var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
module.exports = Campsi.extend('component', 'campsi/entries-and-drafts', function ($super) {

    return {

        getDefaultValue: function(){
          return {
              drafts: [],
              entries: [],
          }
        },
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {

                async.forEach(['entries', 'drafts'], function (item, cb) {
                    Campsi.create('array', {
                        context: instance.context,
                        value: [],
                        options: {
                            newItem: false,
                            items: {
                                type: 'campsi/entries-and-drafts/item'
                            }
                        }
                    }, function (comp) {
                        instance[item] = comp;
                        cb();
                    });
                }, function () {
                    instance.nodes.drafts = $('<div class="drafts"><h3><i class="fa fa-eye-slash"></i> Drafts</h3></div>').append(instance.drafts.render());
                    instance.nodes.entries = $('<div class="entries"><h3><i class="fa fa-eye"></i> Published</h3></div>').append(instance.entries.render());
                    instance.mountNode.append(instance.nodes.drafts);
                    instance.mountNode.append(instance.nodes.entries);
                    next();
                });
            })
        },

        attachEvents: function () {
            this.drafts.attachEvents();
            this.entries.attachEvents();
            var instance = this;
            this.entries.bind('change', function () {
                instance.trigger('change');
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                Campsi.wakeUp(instance.nodes.drafts.find('> .component'), instance.context, function (comp) {
                    instance.drafts = comp;
                    Campsi.wakeUp(instance.nodes.entries.find('> .component'), instance.context, function (comp) {
                        instance.entries = comp;
                        next();
                    });
                });
            })
        },

        getNodePaths: function () {
            return {
                drafts: '> .drafts',
                entries: '> .entries'
            }
        },

        valueDidChange: function (next) {
            var instance = this;

            instance.value.drafts = instance.value.drafts || [];
            instance.value.entries = instance.value.entries || [];
            instance.nodes.drafts.toggle(instance.value.drafts.length > 0);
            instance.nodes.entries.toggle(instance.value.entries.length > 0);

            instance.drafts.setValue(instance.value.drafts, function () {
                instance.entries.setValue(instance.value.entries, next, false);
            }, false);
        },

        save: function () {
            var instance = this;
            $.ajax({
                url: this.context.apiURL('collection'),
                method: 'PUT',
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify({
                    entries: this.entries.value.map(function (e) {
                        return e._id;
                    })
                })
            }).done(function () {
                instance.trigger('saved');
            });
        },

        serializeValue: function () {

        }
    }
});