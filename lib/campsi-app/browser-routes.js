var routes = require('./routes');
var panels = {};
var signin = require('./auth');


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

    var loadProjects = function (ctx, next) {
        context.projects(false, function (projects) {
            ctx.projects = projects;
            next();
        });
    };

    var loadProject = function (ctx, next) {
        context.project(ctx.params.project, false, function (project) {
            ctx.project = project;
            next();
        });
    };

    var loadProjectUsers = function (ctx, next) {
        context.projectUsers(ctx.params.project, false, function (projectUsers) {
            ctx.project.users = projectUsers;
            next();
        });
    };

    var collectionChanged = true;

    var loadCollection = function (ctx, next) {
        if (ctx.params.collection === 'new') {
            delete ctx.params['collection'];
            return next();
        }

        var lastCollection = context._collection;

        context.collection(ctx.params.collection, false, function (collection) {
            ctx.collection = collection;
            collectionChanged = (typeof lastCollection === 'undefined' || lastCollection._id !== collection._id);
            next();
        });
    };

    var loadComponents = function (ctx, next) {
        context.components(false, function (components) {
            ctx.components = components;
            next();
        })
    };

    var loadEntriesAndDrafts = function (ctx, next) {

        context.entriesAndDrafts(collectionChanged, function (items) {
            ctx.entriesAndDrafts = items;
            next();
        });
    };

    var loadEntry = function (ctx, next) {
        context.entry(ctx.params.entry, false, function (entry) {
            ctx.entry = entry;
            next();
        });
    };
    var loadDraft = function (ctx, next) {
        context.draft(ctx.params.draft, false, function (draft) {
            ctx.draft = draft;
            next();
        });
    };

    router('/*', updateLinks);

    router(routes.welcome.path, loadProjects, function (ctx) {
        panels.projects.setValue(ctx.projects, function () {
            layout(routes.welcome.layout);
        });
    });

    router(routes.projects.path, loadProjects, function (ctx) {
        panels.projects.setValue(ctx.projects, function () {
            layout(routes.projects.layout);
        });
    });

    router(routes.newProject.path, loadProjects, function (ctx) {
        panels.projects.setValue(ctx.projects, function () {
            if (window.CAMPSI_USER) {
                panels.project.setValue({}, function () {
                    layout(routes.newProject.layout);
                    panels.project.mountNode.find('.big-title input').focus();
                })
            } else {
                signin();
            }
        });
    });

    router(routes.project.path, loadProjects, loadProject, function (ctx) {
        panels.projects.setValue(ctx.projects, function () {
            panels.project.setValue(ctx.project, function () {
                layout(routes.project.layout);
                panels.project.mountNode.find('.big-title input').focus();
            });
        })
    });

    router(routes.projectUsers.path, loadProject, loadProjectUsers, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            panels.projectUsers.setValue(ctx.project, function () {
                layout(routes.projectUsers.layout);
            });
        });
    });

    router(routes.newCollection.path, loadProject, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            panels.collection.setValue({}, function () {
                layout(routes.collection.layout);
                panels.collection.mountNode.find('.big-title input').focus();
            });
        });
    });

    router(routes.collection.path, loadProject, loadCollection, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            panels.collection.setValue(ctx.collection, function () {
                layout(routes.collection.layout);
                panels.collection.mountNode.find('.big-title input').focus();
            })
        });
    });
    router(routes.entries.path, loadProject, loadCollection, loadEntriesAndDrafts, function (ctx) {
        panels.entries.setValue(ctx.entriesAndDrafts, function () {
            panels.entry.component.setOptions(ctx.collection, function () {
                panels.entry.component.setValue({}, function () {
                    layout(routes.entries.layout);
                });
            });
        });
    });

    router(routes.designer.path, loadProject, loadCollection, loadComponents, function (ctx) {
        panels.designer.setValue(ctx.collection, function () {
            panels.components.setValue(ctx.components, function () {
                layout(routes.designer.layout);
            });
        });
    });

    router(routes.entry.path, loadProject, loadCollection, loadEntriesAndDrafts, loadEntry, function (ctx) {
        panels.entries.setValue(ctx.entriesAndDrafts, function () {
            panels.entry.component.setOptions(ctx.collection, function () {
                panels.entry.setValue(ctx.entry, function () {
                    layout(routes.entry.layout);
                });
            })
        });
    });

    router(routes.draft.path, loadProject, loadCollection, loadEntriesAndDrafts, loadDraft, function (ctx) {
        panels.entries.setValue(ctx.entriesAndDrafts, function () {
            panels.entry.component.setOptions(ctx.collection, function () {
                panels.entry.setValue(ctx.draft, function () {
                    layout(routes.entry.layout);
                });
            })
        });
    });


    updateLinks({path: location.pathname}, function () {
        router.start({dispatch: false});
    });

    return panels;
};
