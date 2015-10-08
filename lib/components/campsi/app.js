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
            comp('project').load(ctx.params._project, function () {
                comp('collection').load(ctx.params.id, function () {
                    layout(routes.collection.layout);
                });
            });
        });

        router(routes.entries.path, function (ctx) {
            comp('entries').load(ctx.params.id, function () {
                comp('entry').loadOptions(ctx.params.id, function () {
                    layout(routes.entry.layout);
                });
            });
        });

        router(routes.designer.path, function (ctx) {
            comp('designer').load(ctx.params.id, function () {
                comp('components').load(function () {
                    layout(routes.designer.layout);
                });
            });
        });

        router(routes.entry.path, function (ctx) {
            comp('entry').load(ctx.params.collectionId, ctx.params.entryId, function () {
                layout(routes.entry.layout);
            });
        });

        router.start({dispatch: false});
    };


    var codeEditor;
    var codeEditorChangeHandler;

    var domReady = function () {

        $(document).on('click', '#entries .array_item > .container > .component', function () {
            var val = $(this).data('value');
            var collectionId = val._collection;
            var entryId = val._id;
            page('/collections/' + collectionId + '/' + entryId);
        });

        $(document).on('dblclick', '.component.campsi_collection-designer_field header', function () {
            $(this).closest('.component').toggleClass('closed');
        });

        $(document).on('click', '#code-editor-container button.close', closeCodeEditor);
        $(document).on('click', '#code-editor-container button.validate', function () {
            codeEditorChangeHandler(codeEditor.getValue());
            closeCodeEditor();
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