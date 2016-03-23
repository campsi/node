var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var hljs = require('highlight.js');

var Block = function () {
    this.language = 'html';
};

Block.prototype.setValue = function (value) {
    if (this.type === 'html') {
        this.el.html(value);
    } else if (this.type === 'code') {
        this.el.find('code').html(hljs.highlight(this.language, value).value);
    } else if (this.type === 'url') {
        this.el.find('input').val(value);
        this.el.find('a').attr('href', value);
    }
};

module.exports = Campsi.extend('component', 'campsi/sdk', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                title: '',
                intro: '',
                steps: []
            };
        },

        getTagName: function () {
            return 'article';
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.addClass('campsi_sdk');
                instance.mountNode.append('<h1></h1>');
                instance.mountNode.append('<div class="intro"></div>');
                instance.mountNode.append('<ol></ol>');
                instance.steps = [];
                next();
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            instance.steps = [];
            $super.wakeUp.call(instance, el, context, function () {
                instance.mountNode.find('> ol > li').each(function (i, li) {
                    var step = {blocks: []};
                    $(li).find('.block').each(function (i, el) {
                        var block = new Block();
                        var $el = $(el);
                        block.type = $el.data('type');
                        block.language = $el.data('language');
                        block.el = $el;
                        step.blocks.push(block);
                    });
                    instance.steps.push(step);
                });
                next();
            });
        },

        attachEvents: function () {
            this.mountNode.find('.toggle-optional').click(function () {
                $(this).closest('li').toggleClass('visible');
            });
        },

        createStep: function (definition) {
            var instance = this;
            var $li = $('<li>');
            var $h2 = $('<h2>').text(definition.title);


            if (definition.optional) {
                $li.addClass('optional');
                $h2.append(' <a class="toggle-optional" href="#">(optional)</a>')
            }

            $li.append($h2);

            var step = {blocks: []};

            definition.blocks.forEach(function (block) {

                var blockObject = new Block();
                blockObject.el = $('<div class="block">');

                if (typeof block === 'string') {
                    blockObject.el.html(block);
                    blockObject.type = 'html';
                    blockObject.el.attr('data-type', 'html');
                } else if (block.type === 'code') {
                    blockObject.el.attr('data-language', block.language);
                    blockObject.el.attr('data-type', 'code');
                    blockObject.type = 'code';
                    blockObject.language = block.language || blockObject.language;
                    var $pre = $('<pre></pre>');
                    var $code = $('<code></code>');
                    $code.addClass(block.language);
                    $pre.append($code);
                    blockObject.el.append($pre);

                    if (block.value) {
                        blockObject.setValue(block.value);
                    }
                } else if (block.type === 'url') {
                    blockObject.el.attr('data-type', 'url');
                    blockObject.type = 'url';

                    blockObject.el.append('<input disabled>');
                    blockObject.el.append('<a class="btn" target="_blank"><i class="fa fa-external-link"></i></a>');

                    if (block.value) {
                        blockObject.setValue(block.value);
                    }
                }
                $li.append(blockObject.el);
                step.blocks.push(blockObject);
            });

            instance.steps.push(step);
            return $li;
        },

        optionsDidChange: function (next) {
            var instance = this;
            instance.steps.length = 0;
            var $node = this.mountNode;
            var $ol = $node.find('> ol').empty();
            $node.find('> h1').text(this.options.title);
            $node.find('> .intro').html(this.options.intro);
            this.options.steps.forEach(function (step) {
                $ol.append(instance.createStep(step));
            });
            next();
        }

    }
});