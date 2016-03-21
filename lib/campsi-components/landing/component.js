var Campsi = require('campsi-core');
var fs = require('fs');
var path = require('path');
var isBrowser = require('is-browser');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/landing', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                if (!isBrowser) {
                    fs.readFile(path.join(__dirname, './assets/landing.html'), 'utf-8', function (err, html) {
                        instance.mountNode.html(html);
                        next();
                    });
                }
            });
        },

        getOffsets: function () {
            var instance = this;
            instance.sections = [];
            [
                '.brand',
                '.added-value',
                '.editing',
                '.api',
                '.complex-structures',
                '.pricing'
            ].forEach(function (section) {
                var $section = instance.mountNode.find(section);
                var top = $section.offset().top;
                instance.sections.push({
                    selector: section,
                    el: $section.get(0),
                    min: top,
                    max: top + $section.height()
                });
            });

            return instance.sections;
        },

        attachEvents: function () {
            var instance = this;
            instance.getOffsets();
            $('#welcome > .content').on('scroll', function () {
                var windowHeight = $(window).height();
                var scrollTop = this.scrollTop;
                instance.sections.forEach(function (section) {
                    section.inViewport = section.max > (scrollTop - windowHeight / 2) && section.min < (scrollTop + windowHeight / 2);
                    /*

                     var invisibleTop = scrollTop - section.min;
                     var invisibleBottom = section.max - (scrollTop + windowHeight);

                     if(invisibleBottom < 0){
                     invisibleBottom = 0;
                     }

                     if(invisibleTop < 0){
                     invisibleTop = 0;
                     }
                     */

                    $(section.el).toggleClass('visible', section.inViewport);
                })
            });
        }
    }
});