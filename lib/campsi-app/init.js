(function () {

    require('filedrop');
    require('jquery-circle-progress');

    //lib
    var Campsi = require('campsi');
    var $ = require('cheerio-or-jquery');
    var async = require('async');
    var page = require('page');
    var Context = require('./context');
    var context = new Context(window.CAMPSI_CONTEXT);


    // components
    var loader = require('./loader');
    var signin = require('./auth');
    var dnd = require('./dnd');

    // vars
    var panelComponents = {};

    Campsi.drake = dnd;

    var appEl = $('#app')[0];
    var panelsContainer = $(appEl).find('> .panels')[0];

    function resetScroll() {
        requestAnimationFrame(function () {
            panelsContainer.scrollLeft = 0;
            appEl.scrollLeft = 0;
        })
    }

    $(function () {

        var analytics = require('./analytics');

        if (window.CAMPSI_USER) {
            analytics.identify(window.CAMPSI_USER._id);
        }

        analytics.page();

        $(document)
            .on('focusout', resetScroll)
            .on('focus', resetScroll)
            //.on('keyup', function (e) {
            //    if (e.keyCode === 27) {
            //        page($('.panel.main header a.back').attr('href'));
            //    }
            //})
            .on('keyup', 'input', function (e) {
                e.stopPropagation();
            })
            .on('dblclick', '.component.campsi_collection-designer_field header', function () {
                $(this).closest('.component').toggleClass('closed')
            })
            .on('click', 'button.logout', function () {
                page('/logout')
            });


        $('.panel > .content').on('scroll', function () {
            var panelContent = this;
            var panel = $(panelContent).closest('.panel');
            var scrollTop = this.scrollTop;

            requestAnimationFrame(function () {
                panel.toggleClass('scroll', (scrollTop > 0));
            })
        }).on('touchmove', function (e) {
            e.stopPropagation();
        });


        $('.login').click(signin);
    });

    loader(function () {

        panelComponents = require('./browser-routes')(page, context);

        async.forEach($('.panel'), function (el, cb) {
            Campsi.wakeUp(el, context, function (comp) {
                comp.attachEvents();
                panelComponents[comp.id] = comp;
                cb();
            });
        }, function () {
            window.panels = panelComponents;
        });
    });

    document.addEventListener("touchmove", function (event) {
        event.preventDefault();
    });


})();