var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('file', 'file/image', function () {
    return {

        valueDidChange: function(next){
            var $value = this.mountNode.find('.value').empty();
            var $img;
            if (this.value && this.value.uri) {
                $img = $('<img>');
                $img.attr('src', this.value.uri + '?h=400&fit=max');
                $value.append($img);
            }
            next();
        },

        renderValue: function () {
            if (this.value && this.value.uri) {
                var $img = $('<img>');
                $img.attr('src', this.value.uri);
                return $img;
            }
            return '';
        }

    }
});