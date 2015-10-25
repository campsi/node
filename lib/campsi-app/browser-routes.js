var routes = require('./routes');
var panels = {};
var signin = require('./auth');
var context = require('app-context');

var comp = function (name) {
    return panels[name].component;
};

var classesToRemove = ['next', 'prev', 'hidden', 'main'].concat((function () {
    var i = 1;
    var classes = [];
    for (; i < 11; i++) {
        classes.push('l' + i * 10);
    }
    return classes;
})()).join(' ');

var layout = function (layout) {

    requestAnimationFrame(function () {
        var id;

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
    });
};

var loadCollection = function (ctx, next) {
    if (ctx.params.collection === 'new') {
        delete ctx.params['collection'];
        return next();
    }

    context.collection(ctx.params.collection, false, function (collection) {
        ctx.collection = collection;
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

module.exports = function (router) {

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
        if (window.CAMPSI_USER) {
            panels.project.setValue(undefined, function () {
                layout(routes.newProject.layout);
                panels.project.mountNode.find('.big-title input').focus();
            })
        } else {
            signin();
        }
    });

    router(routes.project.path, loadProjects, loadProject, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            layout(routes.project.layout);
            panels.project.mountNode.find('.big-title input').focus();
        });
    });

    router(routes.projectUsers.path, loadProjectUsers, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            panels.projectUsers.setValue(ctx.project, function () {
                layout(routes.projectUsers.layout);
            });
        });
    });

    router(routes.newCollection.path, loadProject, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            panels.collection.setValue(undefined, function () {
                layout(routes.collection.layout);
                panels.collection.mountNode.find('.big-title input').focus();
            });
        });
    });

    router(routes.collection.path, loadProject, loadCollection, function (ctx) {
        panels.project.setValue(ctx.project, function () {
            panels.collection.setValue(ctx.collection, function(){
                layout(routes.collection.layout);
                panels.collection.mountNode.find('.big-title input').focus();
            })
        });
    });
    router(routes.entries.path, function (ctx) {
        comp('entries').load(ctx.params.project, ctx.params.collection, function () {
            comp('entry').loadOptions(ctx.params.project, ctx.params.collection, function () {
                comp('entry').setValue(undefined, function () {
                    layout(routes.entries.layout);
                });
            });
        });
    });

    // ATTENTION à l'ordre des routes. Si placé après entry, entry prend le dessus !
    router(routes.designer.path, function (ctx) {
        comp('designer').load(ctx.params.project, ctx.params.collection, function () {
            comp('components').load(function () {
                layout(routes.designer.layout);
            });
        });
    });

    router(routes.entry.path, function (ctx) {
        comp('entry').load(ctx.params.project, ctx.params.collection, ctx.params.entry, function () {
            layout(routes.entry.layout);
        });
    });


    updateLinks({path: location.pathname}, function () {
        router.start({dispatch: false});
    });

    return panels;
};
