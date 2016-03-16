var routes = require('./routes');
var panels = {};
var signin = require('./auth');
var async = require('async');

module.exports = function (router, context) {

    var classesToRemove = ['next', 'prev', 'hidden', 'main'].concat((function () {
        var i = 1;
        var classes = [];
        for (; i < 11; i++) {
            classes.push('l' + i * 10);
        }
        return classes;
    })()).join(' ');

    var appEl;
    var panelsContainer;


    var execLayout = function (ctx, next) {

        next();

        if (typeof  appEl === 'undefined') {
            appEl = $('#app')[0];
            panelsContainer = $(appEl).find('> .panels')[0];
        }


        panelsContainer.scrollLeft = 0;
        appEl.scrollLeft = 0;

        requestAnimationFrame(function () {
            var id;

            panelsContainer.scrollLeft = 0;
            appEl.scrollLeft = 0;

            for (id in panels) {
                if (panels.hasOwnProperty(id)) {
                    var $node = panels[id].mountNode;
                    var layoutClasses = currentLayout[id] || ['next'];
                    $node.removeClass(classesToRemove);

                    layoutClasses.forEach(function (cls) {
                        if (cls.substring(0, 1) === 'w') {
                            $node.removeClass('w10 w20 w30 w40 w50 w60 w70 w80 w90 w100');
                        }
                        if (cls.substring(0, 1) === 'l') {
                            $node.removeClass('l10 l20 l30 l40 l50 l60 l70 l80 l90 l100');
                        }
                    });

                    $node.addClass(layoutClasses.join(' '));
                }
            }

            panelsContainer.scrollLeft = 0;
            appEl.scrollLeft = 0;
        })
    };

    var currentLayout;


    var layout = function (layout) {
        currentLayout = layout;
    };

    var updateLinks = function (ctx, next) {
        $('[href^="/"]').removeClass('active').filter('[href="' + ctx.path + '"]').addClass('active');
        next();
    };

    var showLoading = function (ctx, next) {
        $('#loading').addClass('visible');
        $('#app').addClass('loading');
        next();
    };
    var hideLoading = function (ctx, next) {
        $('#loading').removeClass('visible');
        $('#app').removeClass('loading');
        next();
    };

    var sendPageView = function (ctx, next) {
        window.analytics.page(ctx.pathname);
        next();
    };

    /*
     var setPageTitle = function(title){
     $('title').text(title);
     };*/

    var loadHooks = {};

    var routeMatch = function (ctx, next) {
        ctx.routeMatch = true;
        next();
    };

    var load = function () {
        var resources = Array.prototype.slice.call(arguments);
        return function (ctx, next) {
            async.forEachSeries(resources, function (resource, cb) {
                if (ctx.params[resource] === 'new') {
                    return cb();
                }
                context.get(resource, ctx.params, function (data) {
                    ctx[resource] = data;
                    if (Array.isArray(loadHooks[resource])) {
                        async.forEach(loadHooks[resource], function (hook, iterationCallback) {
                            hook(data, iterationCallback);
                        }, cb);
                    } else {
                        return cb();
                    }
                });
            }, function () {
                next();
            });
        }
    };


    var registerLoadHook = function (resource, hook) {
        loadHooks[resource] = loadHooks[resource] || [];
        loadHooks[resource].push(hook);
    };

    registerLoadHook('projects', function (projects, cb) {
        panels.projects.setSavedValue(projects, cb);
    });

    registerLoadHook('templates', function (templates, cb) {
        panels.project.component
            .fields.collections
            .component.newItem
            .setOptions({templates: templates}, cb);
    });

    registerLoadHook('project', function (project, cb) {
        panels.project.setSavedValue(project, cb);
    });

    registerLoadHook('collection', function (collection, cb) {
        panels.entries.setButtonsHref();
        async.parallel([
            function (iterationCallback) {
                panels.collection.setSavedValue(collection, iterationCallback);
            },
            function (iterationCallback) {
                panels.entry.component.setOptions(collection, iterationCallback);
            }
        ], cb);
    });

    registerLoadHook('entriesAndDrafts', function (entriesAndDrafts, cb) {
        panels.entries.setSavedValue(entriesAndDrafts, cb);
    });

    registerLoadHook('projectDeployments', function (project, cb) {
        panels.projectDeployments.setSavedValue(project, cb);
    });

    registerLoadHook('entry', function (entry, cb) {
        panels.entry.setSavedValue(entry, cb);
        panels.entry.mountNode.removeClass('draft');
    });

    registerLoadHook('draft', function (draft, cb) {
        panels.entry.setSavedValue(draft, cb);
        panels.entry.mountNode.addClass('draft');
    });

    registerLoadHook('components', function (components, cb) {
        panels.components.setSavedValue(components, cb);
    });

    router('/*', showLoading);

    router(routes.welcome.path, routeMatch, load('projects'), function (ctx, next) {
        layout(routes.welcome.layout);
        next();
    });

    router(routes.dashboard.path, routeMatch, load('projects'), function (ctx, next) {
        layout(routes.dashboard.layout);
        next();
    });

    router(routes.projects.path, routeMatch, load('projects'), function (ctx, next) {
        layout(routes.projects.layout);
        next();
    });

    router(routes.newProject.path, routeMatch, load('projects', 'templates'), function (ctx, next) {
        ctx.isNewProject = true;
        panels.project.context.invalidate('project', true);
        if (window.CAMPSI_USER) {
            panels.project.mountNode.addClass('new');
            panels.project.setValue({showIntro: true}, function () {
                layout(routes.newProject.layout);
                panels.project.mountNode.find('.big-title input').focus();
                next();
            });
        } else {
            signin();
        }
    });

    router(routes.project.path, routeMatch, load('projects', 'project', 'templates'), function (ctx, next) {
        if (ctx.isNewProject === true) {
            return next();
        }
        layout(routes.project.layout);
        panels.project.mountNode.removeClass('new');
        panels.project.mountNode.find('.big-title input').focus();
        next();
    });

    router(routes.projectUsers.path, routeMatch, load('project', 'projectUsers', 'projectGuests', 'templates'), function (ctx, next) {
        ctx.project.users = ctx.projectUsers;
        ctx.project.guests = ctx.projectGuests;
        panels.projectUsers.setValue(ctx.project, function () {
            layout(routes.projectUsers.layout);
            next();
        });
    });
    router(routes.projectDeployments.path, routeMatch, load('project', 'projectDeployments', 'templates'), function (ctx, next) {
        panels.projectDeployments.setValue(ctx.project, function () {
            layout(routes.projectDeployments.layout);
            next();
        });
    });

    router(routes.billing.path, routeMatch, load('project'), function (ctx, next) {
        layout(routes.billing.layout);
        next();
    });

    router(routes.newCollection.path, routeMatch, load('project', 'components'), function (ctx, next) {
        ctx.isNewCollection = true;

        panels.project.context.invalidate('collection', true);
        if (panels.collection.component) {
            panels.collection.component.removeHighlighting();
        }

        panels.collection.mountNode.addClass('new');

        panels.collection.setValue({showIntro: true}, function () {
            layout(routes.collection.layout);
            next();
        });
    });

    router(routes.collectionFieldProperties.path, routeMatch, load('project', 'collection'), function (ctx, next) {
        panels.collection.component.highlightField(ctx.params.fieldName);
        panels.fieldProperties.setValue({collection: ctx.collection, fieldName: ctx.params.fieldName}, function () {
            layout(routes.collectionFieldProperties.layout);
            next();
        });
    });

    router(routes.collection.path, routeMatch, load('project', 'collection', 'templates', 'components'), function (ctx, next) {
        if (ctx.isNewCollection === true) {
            return next();
        }

        if (panels.collection.component) {
            panels.collection.component.removeHighlighting();
        }
        panels.collection.mountNode.removeClass('new');
        layout(routes.collection.layout);
        next();
    });


    router(routes.entries.path, routeMatch, load('project', 'collection', 'entriesAndDrafts'), function (ctx, next) {
        panels.entry.setValue({}, function () {
            panels.entry.setButtonsHref();
            layout(routes.entries.layout);
            next();
        });
    });

    router(routes.newEntry.path, routeMatch, load('project', 'collection', 'entriesAndDrafts'), function (ctx, next) {
        panels.project.context.invalidate('entry', true);
        panels.entry.setValue({}, function () {
            layout(routes.newEntry.layout);
            next();
        });
    });

    // on invalide entriesAndDrafts pour éviter qu'une liste réordonnée soit perdue au changement d'URL
    // attention il est possible qu'un changement d'url par le client entraine un comportement inattendu
    // il faudrait donc avec un test pour voir si la collection ou le projet a changé pour, dans ce cas,
    // invalider la resource entriesAndDrafts
    // EDIT : supprimé car la mise à jour des entries ne se répercute plus dans la liste... il faut trouver
    // autre chose
    router(routes.entry.path, routeMatch, load('project', 'collection', 'entriesAndDrafts', 'entry'), function (ctx, next) {
        layout(routes.entry.layout);
        next();
    });

    router(routes.draft.path, routeMatch, load('project', 'collection', 'entriesAndDrafts', 'draft'), function (ctx, next) {
        layout(routes.entry.layout);
        next();
    });

    var breakIfRouteDidNotMatch = function (ctx, next) {
        if (ctx.routeMatch === true) {
            ctx.routeMatch = false;
            return next();
        }

        router.stop();
        window.location.href = ctx.path;


    };

    router('*', breakIfRouteDidNotMatch, updateLinks, execLayout, hideLoading, sendPageView);

    updateLinks({path: window.location.pathname}, function () {
        router.start({dispatch: false});
    });

    return panels;
};
