var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/dashboard/widget', function($super){

    return {
        init: function(next){
            var instance = this;
            $super.init.call(instance, function(){
                instance.mountNode.addClass('campsi_dashboard_widget');
                instance.createNodes();
                next.call(instance);
            });
        },

        createNodes: function(){
            this.nodes.header = $('<header></header>');
            this.nodes.header.append($('<img>').attr('src', '/' + this.type + '/icon.png'));
            this.nodes.header.append('<h2>');
            this.mountNode.append(this.nodes.header);

            this.nodes.content = $('<article>');
            this.mountNode.append(this.nodes.content);

            this.nodes.footer = $('<footer>');
            this.mountNode.append(this.nodes.footer);
        },

        getNodePaths: function(){
            return {
                header: '> header',
                content: '> article',
                footer: '> footer'
            }
        },

        optionsDidChange: function(next){
            this.nodes.header.find('h2').text(this.options.header.text);
            next();
        },

        reload: function(){

        }
    }
});