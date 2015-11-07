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
        next();
    };
    var hideLoading = function (ctx, next) {
        $('#loading').removeClass('visible');
        next();
    };

    var load = function () {
        var resources = arguments;
        return function (ctx, next) {
            async.each(resources, function (resource, cb) {
                if(ctx.params[resource] === 'new'){
                    return cb();
                }
                context.get(resource, ctx.params, function (data) {
                    ctx[resource] = data;
                    return cb();
                });
            }, function () {
                next();
            });
        }
    };

    router('/*', showLoading);

    router(routes.welcome.path, load('projects'), function (ctx, next) {
        panels.projects.setValue(ctx.projects, function () {
            layout(routes.welcome.layout);
            next();
        });
    });

    router(routes.projects.path, load('projects'), function (ctx, next) {
        panels.projects.setValue(ctx.projects, function () {
            layout(routes.projects.layout);
            next();
        });
    });

    router(routes.newProject.path, load('projects'), function (ctx, next) {
        panels.projects.setValue(ctx.projects, function () {
            if (window.CAMPSI_USER) {
                panels.project.setValue({}, function () {
                    layout(routes.newProject.layout);
                    panels.project.mountNode.find('.big-title input').focus();
                    next();
                })
            } else {
                signin();
                next();
            }
        });
    });

    router(routes.project.path, load('projects', 'project'), function (ctx, next) {
        panels.projects.setValue(ctx.projects, function () {
            panels.project.setValue(ctx.project, function () {
                layout(routes.project.layout);
                panels.project.mountNode.find('.big-title input').focus();
                next();
            });
        })
    });

    router(routes.projectUsers.path, load('project', 'projectUsers'), function (ctx, next) {
        ctx.project.users = ctx.projectUsers;
        panels.project.setValue(ctx.project, function () {
            panels.projectUsers.setValue(ctx.project, function () {
                layout(routes.projectUsers.layout);
                next();
            });
        });
    });
    router(routes.projectDeployments.path, load('project', 'projectDeployments'), function (ctx, next) {
        panels.project.setValue(ctx.project, function () {
            panels.projectDeployments.setValue(ctx.project, function () {
                layout(routes.projectDeployments.layout);
                next();
            });
        });
    });

    router(routes.newCollection.path, load('project'), function (ctx, next) {
        panels.project.setValue(ctx.project, function () {
            panels.collection.setValue({}, function () {
                layout(routes.collection.layout);
                panels.collection.mountNode.find('.big-title input').focus();
                next();
            });
        });
    });

    router(routes.collection.path, load('project', 'collection'), function (ctx, next) {
        panels.project.setValue(ctx.project, function () {
            panels.collection.setValue(ctx.collection, function () {
                layout(routes.collection.layout);
                panels.collection.mountNode.find('.big-title input').focus();
                next();
            })
        });
    });
    router(routes.entries.path, load('project', 'collection', 'entriesAndDrafts'), function (ctx, next) {
        panels.entries.setValue(ctx.entriesAndDrafts, function () {
            panels.entry.component.setOptions(ctx.collection, function () {
                panels.entry.setValue({}, function () {
                    panels.entry.setButtonsHref();
                    layout(routes.entries.layout);
                    next();
                });
            });
        });
    });

    router(routes.designer.path, load('project', 'collection', 'components'), function (ctx, next) {
        panels.designer.setValue(ctx.collection, function () {
            panels.components.setValue(ctx.components, function () {
                layout(routes.designer.layout);
                next();
            });
        });
    });

    router(routes.entry.path, load('project', 'collection', 'entriesAndDrafts', 'entry'), function (ctx, next) {
        panels.entries.setValue(ctx.entriesAndDrafts, function () {
            panels.entry.component.setOptions(ctx.collection, function () {
                panels.entry.setValue(ctx.entry, function () {
                    layout(routes.entry.layout);
                    next();
                });
            })
        });
    });

    router(routes.draft.path, load('project', 'collection', 'entriesAndDrafts', 'draft'), function (ctx, next) {
        panels.entries.setValue(ctx.entriesAndDrafts, function () {
            panels.entry.component.setOptions(ctx.collection, function () {
                panels.entry.setValue(ctx.draft, function () {
                    layout(routes.entry.layout);
                    next();
                });
            })
        });
    });

    router('*', updateLinks, hideLoading);

    updateLinks({path: location.pathname}, function () {
        router.start({dispatch: false});
    });

    return panels;
};
