(function () {
    var Campsi = require('campsi');
    var $ = require('cheerio-or-jquery');
    var async = require('async');
    var page = require('page');
    var routes = require('./app/routes');

    var panelComponents = {};

    var componentsDidLoad = function () {
        configureRoutes(page);

        comp('entry').bind('saved', function () {
            comp('entries').reload();
        });
    };

    var comp = function (name) {
        return panelComponents[name].component;
    };

    var layout = function (layout) {
        var layoutClasses;
        var id;
        var classesToRemove = ['active', 'next', 'prev', 'hidden'];
        for (id in panelComponents) {
            if (panelComponents.hasOwnProperty(id)) {
                var $node = panelComponents[id].mountNode;
                layoutClasses = layout[id] || [];

                $node.removeClass(function (index, css) {
                    var classes = css.match(/l[0-9]+/g) || [];
                    if (layoutClasses.indexOf('active') > -1) {
                        classes = classes.concat(css.match(/w[0-9]+/g) || []);
                    }

                    return classes.concat(classesToRemove).join(' ');
                });

                $node.addClass((layoutClasses.length === 0) ? 'next' : layout[id].join(' '));
            }
        }
    };

    var configureRoutes = function (router) {

        router(routes.welcome.path, function () {
            comp('projects').load(function () {
                layout(routes.welcome.layout);
            });
        });

        router(routes.projects.path, function () {
            comp('projects').load(function () {
                layout(routes.projects.layout);
            });
        });

        router(routes.newProject.path, function () {
            comp('project').setValue(undefined, function () {
                layout(routes.newProject.layout);
            })
        });

        router(routes.project.path, function (ctx) {
            comp('project').load(ctx.params.id, function () {
                layout(routes.project.layout);
            });
        });

        router(routes.collection.path, function (ctx) {
            comp('collection').load(ctx.params.id, function () {
                layout(routes.collection.layout);
            });
        });

        router(routes.entries.path, function (ctx) {
            console.dir(ctx);
            comp('entries').load(ctx.params.id, function () {
                comp('entry').loadOptions(ctx.params.id, function () {
                    layout(routes.entry.layout);
                });
            });
        });

        router(routes.designer.path, function (ctx) {
            comp('designer').load(ctx.params.id, function () {
                layout(routes.designer.layout);
            });
        });

        router(routes.entry.path, function (ctx) {
            comp('entry').load(ctx.params.collectionId, ctx.params.entryId, function () {
                layout(routes.entry.layout);
            });
        });

        router.start({dispatch: false});
    };

    var domReady = function () {

        $(document).on('click', '.campsi_entry-list_entry', function () {
            var collectionId = $(this).data('collection');
            var entryId = $(this).data('id');
            page('/collections/' + collectionId + '/' + entryId);
        });

        $(document).on('dblclick', '.component.campsi_collection-designer_field header', function () {
            $(this).closest('.component').toggleClass('closed');
        });

        async.forEach($('.panel'), function (el, cb) {
            Campsi.wakeUp(el, function (comp) {
                comp.attachEvents();
                panelComponents[comp.id] = comp;
                cb();
            });
        }, componentsDidLoad);
    };

    window.panelComponents = panelComponents;

    $(domReady);

})();