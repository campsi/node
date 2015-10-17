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

    var classesToRemove = ['next', 'prev', 'hidden'].concat((function () {
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

    var configureRoutes = function (router) {

        router('*', function (ctx, next) {
            $('[href^="/"]').removeClass('active').filter('[href="' + ctx.path + '"]').addClass('active');
            next();
        });

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
            comp('project').load(ctx.params.project, function () {
                layout(routes.project.layout);
            });
        });

        router(routes.projectUsers.path, function (ctx) {
            comp('project').load(ctx.params.project, function () {
                comp('users').setValue(comp('project').value, function () {
                    layout(routes.projectUsers.layout);
                })
            });
        });

        router(routes.collection.path, function (ctx) {
            comp('project').load(ctx.params.project, function () {
                comp('collection').load(ctx.params.project, ctx.params.collection, function () {
                    layout(routes.collection.layout);
                });
            });
        });

        router(routes.entries.path, function (ctx) {
            comp('entries').load(ctx.params.project, ctx.params.collection, function () {
                comp('entry').loadOptions(ctx.params.project, ctx.params.collection, function () {
                    comp('entry').setValue(undefined, function () {
                        layout(routes.entry.layout);
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


        router.start({dispatch: false});
    };


    var codeEditor;
    var codeEditorChangeHandler;

    var domReady = function () {
        $(document).on('focusout', function (e) {
            requestAnimationFrame(function () {
                $('.vmax').each(function (i, el) {
                    el.scrollTop = 0;
                });
            })
        }).on('dblclick', '.component.campsi_collection-designer_field header', function () {
            $(this).closest('.component').toggleClass('closed');
        }).on('click', '#code-editor-container button.close', closeCodeEditor)
            .on('click', '#code-editor-container button.validate', function () {
                    codeEditorChangeHandler(codeEditor.getValue());
                    closeCodeEditor();
                });

        $('.cell.scroll').on('scroll', function () {
            $(this).closest('.panel').toggleClass('scroll', (this.scrollTop > 0));
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

    var closeCodeEditor = function () {
        $('#modal').hide();
    };

    Campsi.openCodeEditor = function (options, value, onChange) {
        $('#modal').show();
        codeEditorChangeHandler = onChange;

        if (typeof ace === 'undefined') {
            Campsi.loader.js('/lib/ace-builds-bower-patched/src-min-noconflict/ace.js', function () {
                var waitForAce = function (ready) {

                    if (typeof ace === 'undefined') {
                        setTimeout(function () {
                            waitForAce(ready);
                        }, 100);
                    } else {
                        ready();
                    }
                };

                waitForAce(function () {
                    codeEditor = ace.edit('code-editor');
                    codeEditor.getSession().setMode(options.mode);
                    codeEditor.setTheme('ace/theme/monokai');
                    codeEditor.setValue(value);
                });
            });
        } else {
            codeEditor.setValue(value);
        }
    };

    $(domReady);

})();