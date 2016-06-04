'use strict';

var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var isBrowser = require('is-browser');
module.exports = Campsi.extend('component', 'campsi/publish/facebook/post', function ($super) {

    return {
        valueDidChange: function (next) {
            this.mountNode.empty();

            if (this.value) {
                var parts = this.value.split('_');
                var href = 'https://www.facebook.com/' + parts[0] + '/posts/' + parts[1] + '?=width=360';
                var $post = $('<div>').addClass('fb-post');
                $post.attr('data-href', href);
                this.mountNode.append($post);
            }

            if(isBrowser && typeof window.FB !== 'undefined'){
                FB.XFBML.parse(this.mountNode.get(0));
            }

            next();
        }
    }
});