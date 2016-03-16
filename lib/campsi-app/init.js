require('moment/locale/fr');

(function () {

    //lib
    var Campsi = require('campsi-core');
    var $ = require('cheerio-or-jquery');
    var async = require('async');
    var page = require('page');
    var Context = require('./context');
    var context = new Context(window.CAMPSI_CONTEXT);
    var deepcopy = require('deepcopy');
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


        $('.login').click(function(){signin('login')});
        $('.signup').click(function(){signin('signup')});
    });

    loader(function () {

        panelComponents = require('./browser-routes')(page, context);

        // todo ne réveiller que les panels actifs
        async.forEach($('.panel'), function (el, cb) {
            Campsi.wakeUp(el, context, function (comp) {
                comp.attachEvents();
                panelComponents[comp.id] = comp;
                cb();
            });
        }, function () {
            window.panels = panelComponents;

            //todo test

            panelComponents.fieldProperties.component.bind('fieldPropertiesChange', function (event) {

                var newValue = deepcopy(panelComponents.collection.component.value);
                newValue.fields = deepcopy(event.fields);
                panelComponents.collection.setValue(newValue, function () {
                });
            });
        });
    });

    document.addEventListener("touchmove", function (event) {
        event.preventDefault();
    });


})();