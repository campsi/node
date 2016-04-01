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
                    fs.readFile(path.join(__dirname, './assets/landing.' + instance.context.locale + '.html'), 'utf-8', function (err, html) {
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
                '#landing-brand',
                '#landing-added-value',
                '#landing-editing',
                '#landing-api',
                '#landing-pricing'
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

            $.easing.easeOutElastic = function (x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t === 0) {
                    return b;
                }
                if ((t /= d) === 1) {
                    return b + c;
                }
                if (!p) {
                    p = d * .3;
                }

                if (a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else {
                    s = p / (2 * Math.PI) * Math.asin(c / a);
                }

                return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
            };

            instance.getOffsets();


            $('#welcome > .content').on('scroll', function () {
                var windowHeight = $(window).height();
                var scrollTop = this.scrollTop;
                var wasInViewport;
                instance.sections.forEach(function (section) {

                    wasInViewport = section.inViewport;

                    section.inViewport = section.max > (scrollTop - windowHeight / 2) && section.min < (scrollTop + windowHeight / 2);

                    if (section.inViewport === true && wasInViewport === false) {
                        $(section.el).trigger('visible');
                    } else if (section.inViewport === false && wasInViewport === true) {
                        $(section.el).trigger('invisible');
                    }
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
                });
            });

            instance.mountNode.find('#landing-pricing').on('visible', function () {
                var $elem = $(this).find('.price');
                $({deg: -180}).animate({deg: 0}, {
                    duration: 5000,
                    easing: 'easeOutElastic',
                    step: function (now) {
                        $elem.css({
                            transform: 'rotate(' + now + 'deg)'
                        });
                    },
                    complete: function () {
                        //$('#welcome').removeClass('w100').addClass('w80');
                        //$('#projects').removeClass('next').addClass('l80 w20');
                    }
                });
            });

            var timeout;
            instance.mountNode.find('#landing-added-value').on('visible', function () {
                var $activities = $(this).find('.activities');
                timeout = setTimeout(function () {
                    $activities.addClass('with-campsi');
                }, 2000);
            }).on('invisible', function () {
                var $activities = $(this).find('.activities');
                $activities.removeClass('with-campsi');
                if (timeout) {
                    clearTimeout(timeout);
                }
            });
        }
    }
});