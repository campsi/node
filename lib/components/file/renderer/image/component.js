'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('file/renderer', 'file/renderer/image', function ($super) {
    return {
        getDefaultOptions: function () {
            return { maxHeight: 200 };
        },
        updatePreview: function () {
            // todo integrate imgix sdk
            var ratio;
            var $img = $('<img>');
            $img.attr('src', this.value.src + '?h=200&fit=max');
            if (this.value.height && this.value.width) {
                ratio = this.value.width / this.value.height;
                $img.attr('width', Math.round(this.options.maxHeight * ratio));
                $img.attr('height', this.options.maxHeight);
            }
            this.nodes.preview.empty().append($img);
        },
        getMetadata: function () {
            var metadata = $super.getMetadata.call(this);
            if (this.value.height && this.value.width) {
                metadata[this.context.translate('component.file/renderer/image.meta.dimensions')] = this.value.width + 'px &times; ' + this.value.height + 'px';
            }
            return metadata;
        }
    };
});