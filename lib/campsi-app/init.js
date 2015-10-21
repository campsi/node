(function () {

    //lib
    var Campsi = require('campsi');
    var $ = require('cheerio-or-jquery');
    var async = require('async');
    var page = require('page');

    var noop = function () {

    };

    // components
    var codeEditor = require('./code-editor');
    var loader = require('./loader');
    var signin = require('./auth');
    var dnd = require('./dnd');

    // vars
    var panelComponents = {};

    Campsi.openCodeEditor = codeEditor.open.bind(codeEditor);
    Campsi.drake = dnd;

    $(function () {
        $(document).on('focusout', function (e) {
            requestAnimationFrame(function () {
                $('.vmax').each(function (i, el) {
                    el.scrollTop = 0;
                });
                $('#app > .panels')[0].scrollLeft = 0;
            })
        }).on('dblclick', '.component.campsi_collection-designer_field header', function () {
            $(this).closest('.component').toggleClass('closed')
        }).on('click', '#code-editor-container button.validate', function () {
            codeEditor.triggerChange();
            codeEditor.close();
        }).on('click', '#code-editor-container button.close', codeEditor.close.bind(codeEditor));
        /*
         var startTime;
         var delay = 500;
         var current;
         var delta;

         var whenScrollEnds = function (cb) {
         function loop() {
         current = new Date().getTime();
         delta = current - startTime;
         console.info(delta);
         delta >= delay ? cb.call() : requestAnimationFrame(loop);
         }

         startTime = new Date().getTime();
         requestAnimationFrame(loop);
         };
         */
        $('.panel').on('scroll', function () {
            var panel = this;
            var scrollTop = this.scrollTop;

            requestAnimationFrame(function () {
                $(panel).toggleClass('scroll', (scrollTop > 0));
                //whenScrollEnds(function () {
                //    console.info("scroll end", panel.id);
                $(panel).find('header')
                    .css('transform', 'translateY(' + scrollTop + 'px)');
                //});
            })
        }).on('touchmove', function (e) {
            e.stopPropagation();
        });

        $('.login').click(signin);
    });

    loader(function () {

        panelComponents = require('./browser-routes')(page);

        async.forEach($('.panel'), function (el, cb) {
            Campsi.wakeUp(el, function (comp) {
                comp.attachEvents();
                panelComponents[comp.id] = comp;
                cb();
            });
        }, function () {
            panelComponents['project'].component.bind('reset', function (redirect) {
                panelComponents['projects'].component.load(function () {
                    if (redirect) {
                        page(redirect);
                    }
                });
            });
            panelComponents['collection'].component.bind('reset', function (redirect) {
                panelComponents['project'].component.reload(function () {
                    if (redirect) {
                        page(redirect);
                    }
                });

            });
        });
    });

    document.addEventListener("touchmove", function (event) {
        event.preventDefault();
    });


})();