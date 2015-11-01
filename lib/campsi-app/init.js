(function () {

    //lib
    var Campsi = require('campsi');
    var $ = require('cheerio-or-jquery');
    var async = require('async');
    var page = require('page');
    var Context = require('app-context');
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
        $(document)
            .on('focusout', resetScroll)
            .on('focus', resetScroll)
            .on('keyup', function(e){
                if(e.keyCode === 27){
                    page($('.panel.main header a.back').attr('href'));
                }
            })
            .on('keyup', 'input', function(e){
                e.stopPropagation();
            })
            .on('dblclick', '.component.campsi_collection-designer_field header', function () {
                $(this).closest('.component').toggleClass('closed')
            });

        $('.panel').on('scroll', function () {
            var panel = this;
            var scrollTop = this.scrollTop;

            requestAnimationFrame(function () {
                $(panel).toggleClass('scroll', (scrollTop > 0));
                $(panel).find('> header').css('transform', 'translateY(' + scrollTop + 'px)');
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
            panelComponents.project.component.bind('reset', function (redirect) {
                context.projects(true, function (projects) {
                    panelComponents.projects.setValue(projects, function () {
                        if (redirect) {
                            page(redirect);
                        }
                    });
                });
            });
            panelComponents['collection'].component.bind('reset', function (redirect) {
                context.project(null, true, function (project) {
                    panelComponents.project.component.setValue(project, function () {
                        if (redirect) {
                            page(redirect);
                        }
                    });
                });
            });
            panelComponents['entry'].component.bind('reset', function (redirect) {
                context.entriesAndDrafts(true, function (entriesAndDrafts) {
                    panelComponents.entries.component.setValue(entriesAndDrafts, function () {
                        if (redirect) {
                            page(redirect);
                        }
                    });
                });
            });

            window.panels = panelComponents;
        });
    });

    document.addEventListener("touchmove", function (event) {
        event.preventDefault();
    });


})();