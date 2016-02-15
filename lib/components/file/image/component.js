var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('file', 'file/image', function ($super) {
    return {

        onUploadStart: function () {
            this.nodes.file.find('img').fadeOut(300, function () {
                $(this).remove();
            })
        },

        renderValue: function () {
            var $img = $('<img>');
            if (this.value && this.value.uri) {
                $img.attr('src', this.value.uri);
            }
            return $img.html();
        },

        valueDidChange: function (next) {
            var instance = this;
            $super.valueDidChange.call(this, function () {
                if (typeof instance.value !== 'undefined') {
                    instance.nodes.file.empty().append($('<img>').attr('src', instance.value.uri + '?w=400'));
                } else {
                    instance.nodes.file.empty()
                }
                next();
            })
        }
    }
});