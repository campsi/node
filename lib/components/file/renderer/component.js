'use strict';
/**
 * Created by romain on 24/03/2016.
 */
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('component', 'file/renderer', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.preview = $('<div class="preview">');
                instance.nodes.preview.append(this.createIcon());
                instance.nodes.meta = $('<div class="meta"><table></table></div>');
                instance.nodes.download = $('<a class="btn download" download><i class="fa fa-download"></i></a>');
                instance.nodes.download.attr('title', instance.context.translate('component.file/renderer.download'));
                instance.nodes.info = $('<a class="btn info"><i class="fa fa-info"></i></a>');
                instance.nodes.info.attr('title', instance.context.translate('component.file/renderer.info'));
                instance.nodes.buttons = $('<div class="buttons">');
                instance.nodes.buttons.append(instance.nodes.download);
                instance.nodes.buttons.append(instance.nodes.info);
                instance.mountNode.append(instance.nodes.preview);
                instance.mountNode.append(instance.nodes.meta);
                instance.mountNode.append(instance.nodes.buttons);
                next();
            });
        },
        attachEvents: function () {
            var instance = this;
            this.nodes.info.on('click', function () {
                instance.mountNode.toggleClass('show-info');
            });
        },
        getNodePaths: function () {
            return {
                preview: '> .preview',
                meta: '> .meta',
                buttons: '> .buttons',
                info: 'a.info',
                download: '> .buttons > .download'
            };
        },
        createIcon: function () {
            return '<svg width="100%" height="100%" viewBox="0 0 49 64"><g>' + '<path class="file" d="M49,16.8v42.1c0,2.8-2.3,5.1-5.1,5.1H5.1C2.3,64,0,61.7,0,58.9V5.1C0,2.3,2.3,0,5.1,0h27L49,16.8z"/>' + '<path class="corner" d="M49,15.9V18H35.2c-2.9,0-4.2-2.3-4.2-5.2V0h2.1L49,15.9z"/>' + '</g></svg>';
        },
        getMetadata: function () {
            var metadata = {};
            metadata[this.context.translate('component.file/renderer.meta.size')] = this.value.size;
            metadata[this.context.translate('component.file/renderer.meta.name')] = this.value.name;
            metadata[this.context.translate('component.file/renderer.meta.type')] = this.value.mime;
            return metadata;
        },
        updateMeta: function () {
            var meta = this.getMetadata();
            var label;
            var $tr;
            var $table = this.nodes.meta.find('table').empty();
            for (label in meta) {
                if (meta.hasOwnProperty(label)) {
                    $tr = $('<tr>');
                    $tr.append($('<th>').text(label));
                    $tr.append($('<td>').html(meta[label]));
                    $table.append($tr);
                }
            }
        },
        updateActions: function () {
            this.nodes.download.attr('href', this.value.uri);
        },
        updatePreview: function () {
            this.nodes.preview.attr('data-ext', this.getExtension());
            this.nodes.preview.attr('data-filename', this.value.name.substring(0, this.value.name.lastIndexOf('.')));
        },
        getExtension: function () {
            return this.value.name.substring(this.value.name.lastIndexOf('.'));
        },
        valueDidChange: function (next) {
            if (this.value) {
                this.updatePreview();
                this.updateMeta();
                this.updateActions();
                this.mountNode.addClass('has-file');
            } else {
                this.mountNode.removeClass('has-file');
            }
            next();
        }
    };
});