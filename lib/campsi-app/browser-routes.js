var routes = require('./routes');
var panels = {};
var signin = require('./auth');

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

var loadProjects = function(ctx, next) {
    $.ajax({
        url: '/api/v1/projects/'
    }).done(function (data) {
        ctx.projects = data;
        setPanelsContext({projects: ctx.projects});
        next();
    });
};

var loadProject = function (ctx, next) {
    $.ajax({
        url: '/api/v1/projects/' +
        ctx.params.project
    }).done(function (data) {
        ctx.project = data;
        setPanelsContext({project: ctx.project});
    });
};

var loadProjectUsers = function(ctx, next){
    $.ajax({
        url: '/api/v1/projects/' + ctx.params.project + '/users'
    }).done(function(data){
        ctx.project.users = data;
        setPanelsContext({project: ctx.project});
    });
};

var loadCollection = function (ctx, next) {
    $.ajax({
        url: '/api/v1' +
        '/projects/' +
        ctx.params.project +
        '/collections/' + ctx.params.collection
    }).done(function (data) {
        ctx.collection = data;
        setPanelsContext({collection: data});
        next();
    });
};

var loadEntry = function (project, collection, cb) {

};

var setPanelsContext = function(context){
    var id;
    for(id in panels){
        if(panels.hasOwnProperty(id)){
            panels[id].context(context);
        }
    }
}

module.exports = function (router) {

    router('/projects/:project/collections/:collection/*', loadCollection);
    router('/projects/:project/collections/:collection', loadCollection);
    router('/projects/:project', loadProject);
    router('/*', updateLinks);

    router(routes.welcome.path, loadProjects, function () {
            layout(routes.welcome.layout);
    });

    router(routes.projects.path, function () {
            layout(routes.projects.layout);
    });

    router(routes.newProject.path, function () {
        if (window.CAMPSI_USER) {
            panels.project.setValue(undefined, function () {
                layout(routes.newProject.layout);
                panels.project.mountNode.find('.big-title input').focus();
            })
        } else {
            signin();
        }
    });

    router(routes.project.path, function (ctx) {
        panels.project.setValue(ctx.project, function(){
            layout(routes.project.layout);
            panels.project.mountNode.find('.big-title input').focus();
        });
    });

    router(routes.projectUsers.path, loadProjectUsers, function (ctx) {
        panels.project.setValue(ctx.project, function(){
            panels.projectUsers.setValue(ctx.project, function(){
                layout(routes.projectUsers.layout);
            });
        });
    });

    router(routes.newCollection.path, function (ctx) {
        comp('collection').load(ctx.params.project, undefined, function () {
            layout(routes.collection.layout);
            comp('collection').mountNode.find('.big-title input').focus();
        });
    });

    router(routes.collection.path, function (ctx) {
        comp('project').load(ctx.params.project, function () {
            comp('collection').load(ctx.params.project, ctx.params.collection, function () {
                layout(routes.collection.layout);
                comp('collection').mountNode.find('.big-title input').focus();
            });
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
