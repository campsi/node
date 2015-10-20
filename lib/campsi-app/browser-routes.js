var routes = require('./routes');
var panelComponents = {};
var signin = require('./auth');

var comp = function (name) {
    return panelComponents[name].component;
};

var classesToRemove = ['next', 'prev', 'hidden', 'main'].concat((function () {
    var i = 1;
    var classes = [];
    for (; i < 11; i++) {
        //classes.push('w' + i * 10);
        classes.push('l' + i * 10);
    }
    return classes;
})()).join(' ');

var layout = function (layout) {

    requestAnimationFrame(function () {
        var id;

        for (id in panelComponents) {
            if (panelComponents.hasOwnProperty(id)) {
                var $node = panelComponents[id].mountNode;
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

var updateLinks=  function(ctx, next){
    console.info("updateLinks middleware", ctx.path);
    $('[href^="/"]').removeClass('active').filter('[href="' + ctx.path + '"]').addClass('active');
    next();
};

module.exports = function (router) {
    //
    //router('*', function (ctx, next) {
    //    $('[href^="/"]').removeClass('active').filter('[href="' + ctx.path + '"]').addClass('active');
    //    next();
    //});

    router(routes.welcome.path, updateLinks, function () {
        comp('projects').load(function () {
            layout(routes.welcome.layout);
        });
    });

    router(routes.projects.path, updateLinks, function () {
        comp('projects').load(function () {
            layout(routes.projects.layout);
        });
    });

    router(routes.newProject.path, updateLinks, function () {
        if(window.CAMPSI_USER){
            comp('project').setValue(undefined, function () {
                layout(routes.newProject.layout);
            })
        } else {
            signin();
        }
    });

    router(routes.project.path, updateLinks, function (ctx) {
        comp('project').load(ctx.params.project, function () {
            layout(routes.project.layout);
        });
    });

    router(routes.projectUsers.path, updateLinks, function (ctx) {
        comp('project').load(ctx.params.project, function () {
            comp('users').setValue(comp('project').value, function () {
                layout(routes.projectUsers.layout);
            })
        });
    });

    router(routes.collection.path, updateLinks, function (ctx) {
        comp('project').load(ctx.params.project, function () {
            comp('collection').load(ctx.params.project, ctx.params.collection, function () {
                layout(routes.collection.layout);
            });
        });
    });

    router(routes.entries.path, updateLinks, function (ctx) {
        comp('entries').load(ctx.params.project, ctx.params.collection, function () {
            comp('entry').loadOptions(ctx.params.project, ctx.params.collection, function () {
                comp('entry').setValue(undefined, function () {
                    layout(routes.entries.layout);
                });
            });
        });
    });

    // ATTENTION à l'ordre des routes. Si placé après entry, entry prend le dessus !
    router(routes.designer.path, updateLinks, function (ctx) {
        comp('designer').load(ctx.params.project, ctx.params.collection, function () {
            comp('components').load(function () {
                layout(routes.designer.layout);
            });
        });
    });

    router(routes.entry.path, updateLinks, function (ctx) {
        comp('entry').load(ctx.params.project, ctx.params.collection, ctx.params.entry, function () {
            layout(routes.entry.layout);
        });
    });


    router.start({dispatch: false});

    return panelComponents;
};
