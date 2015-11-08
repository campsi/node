var routes = require('./routes');
var panels = {};
var signin = require('./auth');
var async = require('async');
var extend = require('extend');


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

    var layout = function (layout) {

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
                    var layoutClasses = layout[id] || ['next'];
                    $node.removeClass(classesToRemove);

                    layoutClasses.forEach(function (cls) {
                        if (cls.substring(0, 1) === 'w') {
                            $node.removeClass('w10 w20 w30 w40 w50 w60 w70 w80 w90 w100');
                        }
                    });

                    $node.addClass(layoutClasses.join(' '));
                }
            }

            panelsContainer.scrollLeft = 0;
            appEl.scrollLeft = 0;
        })

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

    var loadHooks = {};

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
        panels.projects.setValue(projects, cb);
    });

    registerLoadHook('templates', function (templates, cb) {
        panels.project.component
            .fields.collections
            .component.newItem
            .setOptions({templates: templates}, cb);
    });

    registerLoadHook('project', function (project, cb) {
        panels.project.setValue(project, cb);
    });

    registerLoadHook('collection', function (collection, cb) {
        panels.entries.setButtonsHref();
        async.parallel([
            function (iterationCallback) {
                panels.collection.setValue(collection, iterationCallback);
            },
            function (iterationCallback) {
                panels.designer.setValue(collection, iterationCallback);
            },
            function (iterationCallback) {
                panels.entry.component.setOptions(collection, iterationCallback);
            }
        ], cb);
    });

    registerLoadHook('entriesAndDrafts', function (entriesAndDrafts, cb) {
        panels.entries.setValue(entriesAndDrafts, cb);
    });

    registerLoadHook('entry', function (entry, cb) {
        panels.entry.setValue(entry, cb);
    });

    registerLoadHook('draft', function (draft, cb) {
        panels.entry.setValue(draft, cb);
    });

    registerLoadHook('components', function (components, cb) {
        panels.components.setValue(components, cb);
    });

    router('/*', showLoading);

    router(routes.welcome.path, load('projects'), function (ctx, next) {
        layout(routes.welcome.layout);
        next();
    });

    router(routes.projects.path, load('projects'), function (ctx, next) {
        layout(routes.projects.layout);
        next();
    });

    router(routes.newProject.path, load('projects', 'templates'), function (ctx, next) {
        if (window.CAMPSI_USER) {
            panels.project.setValue({}, function () {
                layout(routes.newProject.layout);
                panels.project.mountNode.find('.big-title input').focus();
                next();
            });
        } else {
            signin();
            next();
        }
    });

    router(routes.project.path, load('projects', 'project', 'templates'), function (ctx, next) {
        layout(routes.project.layout);
        panels.project.mountNode.find('.big-title input').focus();
        next();
    });

    router(routes.projectUsers.path, load('project', 'projectUsers', 'templates'), function (ctx, next) {
        ctx.project.users = ctx.projectUsers;
        panels.projectUsers.setValue(ctx.project, function () {
            layout(routes.projectUsers.layout);
            next();
        });
    });
    router(routes.projectDeployments.path, load('project', 'projectDeployments', 'templates'), function (ctx, next) {
        panels.projectDeployments.setValue(ctx.project, function () {
            layout(routes.projectDeployments.layout);
            next();
        });
    });

    router(routes.newCollection.path, load('project', 'templates'), function (ctx, next) {
        panels.collection.setValue({}, function () {
            layout(routes.collection.layout);
            panels.collection.mountNode.find('.big-title input').focus();
            next();
        });
    });

    router(routes.collection.path, load('project', 'collection', 'templates'), function (ctx, next) {
        layout(routes.collection.layout);
        panels.collection.mountNode.find('.big-title input').focus();
        next();
    });

    router(routes.entries.path, load('project', 'collection', 'entriesAndDrafts'), function (ctx, next) {
        panels.entry.setValue({}, function () {
            panels.entry.setButtonsHref();
            layout(routes.entries.layout);
            next();
        });
    });

    router(routes.designer.path, load('project', 'collection', 'components'), function (ctx, next) {
        layout(routes.designer.layout);
        next();
    });

    router(routes.entry.path, load('project', 'collection', 'entriesAndDrafts', 'entry'), function (ctx, next) {
        layout(routes.entry.layout);
        next();
    });

    router(routes.draft.path, load('project', 'collection', 'entriesAndDrafts', 'draft'), function (ctx, next) {
        layout(routes.entry.layout);
        next();
    });

    router('*', updateLinks, hideLoading);

    updateLinks({path: location.pathname}, function () {
        router.start({dispatch: false});
    });

    return panels;
};
