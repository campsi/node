var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/entry-list/entry', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.title = $('<h4 class="title"></h4>');
                instance.nodes.summary = $('<p class="summary"></p>');
                instance.mountNode.append(instance.nodes.title);
                instance.mountNode.append(instance.nodes.summary);

                next();
            })
        },

        getNodePaths: function(){
            return {
                title: '> .title',
                summary: '> .summary'
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            instance.mountNode.attr('data-id', instance.value.id);
            instance.nodes.title.text(instance.value.data[instance.options.titleAccessor] || "untitled");
            instance.nodes.summary.text(instance.value.data[instance.options.summaryAccessor] || "");
            next();
        }
    }
});