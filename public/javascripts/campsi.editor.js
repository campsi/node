(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./app/routes":2,"async":undefined,"campsi":undefined,"cheerio-or-jquery":undefined,"page":undefined}],2:[function(require,module,exports){
module.exports = {

    welcome: {
        path: '/',
        layout: {
            welcome: ['w70'],
            projects: ['w30', 'l70']
        }
    },
    projects: {
        path: '/projects',
        layout: {
            welcome: ['prev'],
            projects: ['w100']
        }
    },
    project: {
        path: '/projects/:project',
        layout: {
            welcome: ['prev'],
            projects: ['w30'],
            project: ['l30', 'w70']
        }
    },
    projectUsers: {
        path: '/projects/:project/users',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w50'],
            users: ['l50', 'w50']
        }
    },
    newProject: {
        path: '/projects/new',
        layout: {
            welcome: ['prev'],
            projects: ['w30'],
            project: ['l30', 'w70']
        }
    },
    collection: {
        path: '/projects/:project/collections/:collection',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['w50'],
            collection: ['w50', 'l50']
        }
    },
    entries: {
        path: '/projects/:project/collections/:collection/admin',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w30'],
            entry: ['w70', 'l30']
        }
    },
    entry: {
        path: '/projects/:project/collections/:collection/:entry',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            entries: ['w30'],
            entry: ['w70', 'l30']
        }
    },
    designer: {
        path: '/projects/:project/collections/:collection/design',
        layout: {
            welcome: ['prev'],
            projects: ['prev'],
            project: ['prev'],
            collection: ['prev'],
            designer: ['w70'],
            components: ['w70', 'l70']
        }
    }
};
},{}],3:[function(require,module,exports){
var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection-designer', function ($super) {

    return {


        resolveParam: function (param) {

            if (param === 'project' && this.value.__project) {
                return this.value.__project.identifier || this.value.__project._id;
            }
            if (param === 'collection') {
                return this.value.identifier || this.value._id;
            }
        },

        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'fields',
                    type: 'campsi/component-list'
                }]
            };
        },

        getUrl: function () {
            return '/api/v1/projects/' + this.value._project + '/collections/' + this.value._id;
        },

        reload: function (next) {
            var instance = this;
            $.getJSON(instance.getUrl(), function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },
        load: function (project, collection, cb) {
            this.value._project = project;
            this.value._id = collection;
            this.reload(cb);
        },

        save: function () {

            var instance = this;
            var projectUrl = '/api/v1/collections';
            var method = 'POST';

            if (instance.value._id) {
                projectUrl += '/' + instance.value._id;
                method = 'PUT';
            }

            $.ajax({
                url: projectUrl,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function () {
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        serializeValue: function () {
            return {
                _id: this.value._id,
                name: this.value.name,
                identifier: this.value.identifier,
                __project: this.value.__project
            };
        }

    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined,"extend":undefined}],4:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-designer/field', function ($super) {

    return {

        componentType: undefined,

        component: undefined,

        componentOptionsForm: undefined,

        fieldComponentOptions: undefined,

        init: function (next) {

            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.header = $(
                    '<header class="drag-handle">' +
                    '<span class="drag-handle">&equiv;</span>' +
                    '<span class="type"></span>' +
                    '<span class="identifier"></span>' +
                    '<span class="spacer"></span>' +
                    '<button class="advanced">&#65533;</button>' +
                    '<button class="remove-field">&times;</button>' +
                    '</header>'
                );

                Campsi.get('form/field', function (FormField) {
                    var dummy = new FormField();
                    instance.fieldComponentOptions = dummy.getDesignerFormOptions();
                    instance.createForm(next);
                });

                //instance.mountNode.addClass('closed');
            });
        },

        createForm: function (next) {
            var instance = this;
            Campsi.create('form', undefined, undefined, function (form) {
                instance.componentOptionsForm = form;
                instance.nodes.componentOptionsForm = instance.componentOptionsForm.render();

                instance.mountNode.append(instance.nodes.header);
                instance.mountNode.append(instance.nodes.componentOptionsForm);

                next.call();
            });
        },

        getNodePaths: function () {
            return {
                header: '> header',
                componentOptionsForm: '> .component.form'
            }
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, function () {
                Campsi.wakeUp(instance.nodes.componentOptionsForm, function (component) {
                    instance.componentOptionsForm = component;
                    instance.componentType = instance.value.type;
                    next.call();
                });
            });
        },

        attachEvents: function () {
            var instance = this;
            instance.nodes.header.find('button.remove-field').on('click', function () {
                instance.trigger('remove');
            });
            instance.componentOptionsForm.attachEvents();
            instance.componentOptionsForm.bind('change', function () {
                instance.value = this.value;
                // because type property is not available in the componentOptiosnForm,
                // we need to set it here
                instance.value.type = instance.componentType;
                instance.nodes.header.find('.identifier').text(instance.getIdentifier());
                instance.trigger('change');
            });
        },

        getIdentifier: function () {
            return this.value.name
        },

        valueDidChange: function (next) {

            var instance = this;

            if (typeof instance.value === 'undefined') {
                return next.call(instance);
            }

            if (instance.value.type === instance.componentType) {

                instance.componentOptionsForm.setValue(instance.value, function () {
                    next.call(instance);
                });
            } else {

                instance.componentType = instance.value.type;

                instance.nodes.header.find('.type').text(instance.componentType);

                Campsi.get(instance.value.type, function (Component) {

                    var comp = new Component();
                    var options = comp.getDesignerFormOptions();

                    options.fields = instance.fieldComponentOptions.fields.concat(options.fields);

                    instance.componentOptionsForm.setOptions(options, function () {
                        instance.componentOptionsForm.setValue(instance.value, function () {
                            instance.nodes.header.find('.identifier').text(instance.getIdentifier());
                            next.call(instance);
                        });
                    });
                });
            }
        }
    }

});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],5:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection-list/collection', function ($super) {


    return {
        init: function (next) {
            var instance = this;

            $super.init.call(this, function () {
                instance.nodes.name = $('<div class="name drag-handle"></div>');
                instance.nodes.actionsButtonBar = $('<div class="buttons"></div>');
                instance.nodes.editButton = $('<a class="edit btn">Edit</a>');
                instance.nodes.adminButton = $('<a class="admin btn">Admin</a>');
                instance.nodes.designButton = $('<a class="design btn">Design</a>');
                instance.nodes.removeButton = $('<button class="remove">Remove</button>');
                instance.nodes.actionsButtonBar.append(instance.nodes.editButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.adminButton);
                instance.nodes.actionsButtonBar.append(instance.nodes.designButton);
                //instance.nodes.actionsButtonBar.append(instance.nodes.removeButton);
                instance.mountNode.append(instance.nodes.name);
                instance.mountNode.append(instance.nodes.actionsButtonBar);
                next.call(instance);
            });
        },

        getNodePaths: function () {
            return {
                name: '> .name',
                actionsButtonBar: '> .buttons',
                adminButton: '> .buttons > .admin',
                designButton: '> .buttons > .design',
                //removeButton: '> .buttons > .remove',
                editButton: '> .buttons > .edit'
            }
        },

        attachEvents: function () {
            var instance = this;
            //instance.nodes.removeButton.on('click', function () {
                //instance.trigger('remove');
            //});
        },

        valueDidChange: function (next) {
            var instance = this;

            var projectUrl;

            $super.valueDidChange.call(this, function () {
                instance.nodes.name.text(instance.value.name);
                var collectionUrl = Campsi.url(instance.value.__project, instance.value);
                instance.nodes.editButton.attr('href', collectionUrl);
                instance.mountNode.attr('href', collectionUrl);
                instance.nodes.adminButton.attr('href', collectionUrl + '/admin');
                instance.nodes.designButton.attr('href', collectionUrl + '/design');
                next.call(instance);
            });
        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],6:[function(require,module,exports){
var Campsi = require('campsi');

module.exports = Campsi.extend('array', 'campsi/collection-list', function ($super) {
    return {

        getDefaultOptions: function () {
            return {
                newItem: true,
                newItemType: 'campsi/collection-list/wizard',
                newItemLabel: 'createNewCollection',
                items: {
                    type: 'campsi/collection-list/collection',
                    removeButton: false
                }
            }
        },

        attachItemEvents: function (item) {

            var instance = this;

            $super.attachItemEvents.call(this, item);

            item.bind('admin', function (id) {
                instance.trigger('admin', id);
            });

            item.bind('design', function (id) {
                instance.trigger('design', id);
            });
        },

        newItemSubmitHandler: function(event){
            this.trigger('create-collection', this.newItem.value);
            event.preventDefault();
            return false;
        }
    }
});
},{"campsi":undefined}],7:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('form', 'campsi/collection', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    name: 'name',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: 'identifier',
                    additionalClasses: ['identifier']
                },{
                    label: 'templates',
                    name: 'templates',
                    additionalClasses: ['templates', 'closed'],
                    type: 'array',
                    items: {
                        type: 'form',
                        fields: [{
                            name: 'identifier',
                            placeholder: 'template identifier',
                            type: 'text',
                            additionalClasses: ['invisible']
                        },{
                            name: 'markup',
                            type: 'campsi/code-editor',
                            mode: 'ace/mode/handlebars'
                        }]
                    }
                }]
            }
        },


        resolveParam: function(param){
            if(param === 'project') {
                return this.value.__project.identifier || this.value.__project._id;
            }
            if(param === 'collection') {
                return this.value.identifier || this.value._id;
            }
        },

        attachEvents: function () {

            $super.attachEvents.call(this);

            var templates = this.fields.templates;
            templates.nodes.label.on('click', function () {
                templates.mountNode.toggleClass('closed');
            });
        },

        load: function (project, collection, next) {
            var instance = this;
            $.getJSON(Campsi.urlApi(project, collection), function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },


        save: function () {

            var instance = this;
            var url = Campsi.urlApi(instance.value.__project, instance.value);
            var method = 'PUT';

            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function () {
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        serializeValue: function () {
            return {
                _id: this.value._id,
                __project: this.value.__project,
                identifier: this.value.identifier
            }
        }

    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],8:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/component-chooser/component-options', function ($super) {

    return {

        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {

                Campsi.create('form', undefined, undefined, function (form) {
                    instance.optionsForm = form;
                    instance.nodes.type = $('<div class="component-type"></div>');
                    instance.mountNode.append(instance.nodes.type);
                    instance.mountNode.append(instance.optionsForm.render());
                    next();
                });

            });
        },

        attachEvents: function(){
            this.optionsForm.attachEvents();
        },

        getNodePaths: function(){
            return {
                type: '> .component-type'
            }
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .component.form'), function (optionsForm) {
                    instance.optionsForm = optionsForm;
                    next();
                });
            });
        },

        valueDidChange: function (next) {

            var instance = this;

            if (typeof instance.value === 'undefined' || typeof instance.value.type === 'undefined') {
                instance.optionsForm.setOptions(undefined, function () {
                    next();
                });
                return
            }

            Campsi.get(instance.value.type, function (Component) {
                var componentOptions = Component.prototype.getDesignerFormOptions.call();
                instance.optionsForm.setOptions(componentOptions, function () {
                    instance.optionsForm.setValue(instance.value, function () {
                        instance.nodes.type.text(instance.value.type);
                        next();
                    });
                });
            });
        }
    }
});

},{"campsi":undefined,"cheerio-or-jquery":undefined}],9:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/component-chooser', function ($super) {

    return {

        init: function (next) {
            var instance = this;

            $super.init.call(instance, function () {
                instance.nodes.dropzone = $('<div class="dropzone dragzone placeholder"></div>');
                instance.mountNode.append(instance.nodes.dropzone);
                Campsi.create('campsi/component-chooser/component-options', undefined, undefined, function (optionsComponent) {
                    instance.optionsComponent = optionsComponent;
                    instance.nodes.dropzone.append(optionsComponent.render());
                    next.call(instance);
                });
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .dropzone > .campsi_component-chooser_component-options')[0], function (optionsComponent) {
                    instance.optionsComponent = optionsComponent;
                    next();
                });
            });
        },

        attachEvents: function () {

            var instance = this;

            instance.optionsComponent.attachEvents();

            if (typeof Campsi.drake === 'undefined') {
                return;
            }

            Campsi.drake.on('drop', function (el, target, source) {

                if (target !== instance.nodes.dropzone[0]) {
                    return;
                }

                var componentType = $(el).data('component-type');
                if (componentType) {
                    instance.setValue({type: componentType}, function () {
                        instance.nodes.dropzone.find('.icon').remove();
                        instance.trigger('change');
                    });
                }
            });
        },
        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'dropzone': ' > .dropzone'
            });
        },
        valueDidChange: function (next) {
            var instance = this;
            instance.optionsComponent.setValue(instance.value, function () {
                instance.nodes.dropzone.removeClass('placeholder');
                next.call();
            });

        }
    }

});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],10:[function(require,module,exports){
var Campsi = require('campsi');
var extend = require('extend');
var $ = require('cheerio-or-jquery');
//todo move to campsi/collection-designer/component-list
module.exports = Campsi.extend('array', 'campsi/component-list', function ($super) {

    return {

        getDefaultOptions: function () {
            return extend({}, $super.getDefaultOptions(), {
                newItem: false,
                removeButton: true,
                items: {
                    type: 'campsi/collection-designer/field'
                }
            });
        },

        foreignDrop: function (el, source) {
            var $el = $(el);
            var componentType = $el.data('component-type');
            if (componentType) {
                this.createItemAt({type: componentType}, $(el).index(), function () {
                    $el.remove();
                });
            }
        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined,"extend":undefined}],11:[function(require,module,exports){
var Campsi = require('campsi');
var async = require('async');

Campsi.extend('component', 'campsi/entries', function ($super) {


    return {

        resolveParam: function (param) {

            if (param === 'project' && this.value.__project) {
                return this.value.__project.identifier || this.value.__project._id;
            }
            if (param === 'collection') {
                return this.value.identifier || this.value._id;
            }
        },

        getDefaultValue: function () {
            return {
                id: null,
                _project: null,
                selectedEntry: null,
                entries: []
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('campsi/entry-list', undefined, undefined, function (comp) {
                    instance.entryList = comp;
                    instance.mountNode.append(instance.entryList.render());
                    next();
                });
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('.component')[0], function (comp) {
                    instance.entryList = comp;
                    instance.project = instance.value.__project;
                    instance.collection = instance.value;
                    next();
                });
            });
        },

        valueDidChange: function (next) {
            var instance = this;
            if (instance.value._id) {
                instance.project = instance.value.__project.identifier || instance.value._project;
                instance.collection = instance.value.identifier || instance.value._id;

                instance.value.entries.forEach(function (e) {
                    e.__collectionUrl = '/projects/' + instance.project + '/collections/' + instance.collection;
                });

                this.entryList.setValue(this.value.entries, next);
            } else {
                next();
            }
        },

        optionsDidChange: function (next) {
            this.entryList.setTemplate(this.options.template, next)
        },

        attachEvents: function () {
            var instance = this;
            this.entryList.attachEvents();
            this.entryList.bind('change', function () {
                instance.value.entries = instance.entryList.value;
                instance.trigger('change');
            });
        },

        reload: function (next) {
            var instance = this;
            var template;

            var collectionUrl = Campsi.urlApi(this.project, this.collection);

            $.getJSON(collectionUrl + '?with=entries', function (collection) {
                collection.templates.forEach(function (t) {
                    if (t.identifier === 'entry') template = t;
                });

                async.parallel([
                    function (cb) {
                        instance.setValue(collection, function () {
                            instance.trigger('reset');
                            cb();
                        });
                    },
                    function (cb) {
                        if (template) {
                            instance.entryList.setTemplate(template.markup, function () {
                                cb();
                            });
                        } else {
                            cb();
                        }
                    }
                ], next);

            });
        },

        load: function (project, collection, next) {
            this.collection = collection;
            this.project = project;
            this.reload(next);
        },
        save: function () {

            var instance = this;
            var url = Campsi.urlApi(instance.value.__project, instance.value);
            var method = 'PUT';
            var data = {entries: this.value.entries};
            $.ajax({
                url: url,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(data)
            }).done(function () {
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        }

    }
});
},{"async":undefined,"campsi":undefined}],12:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('array', 'campsi/entry-list', function ($super) {

    return {

        getDefaultOptions: function () {
            return {
                newItemForm: false,
                items: {
                    type: 'campsi/entry-list/entry'
                }
            }
        },

        setTemplate: function (template, cb) {
            this.options.items.template = template;
            this.optionsDidChange(cb);
        }
    }

});

},{"campsi":undefined,"cheerio-or-jquery":undefined}],13:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/entry-list/entry', function ($super) {

    return {

        getTagName: function () {
            return 'a';
        },

        getDefaultOptions: function () {
            return {template: '<h4 class="title">{{_id}}</h4>'}
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('handlebars', {}, {}, function (comp) {
                    instance.template = comp;
                    instance.mountNode.append(comp.render()).addClass('drag-handle');
                    next();
                });
            })
        },
        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                Campsi.wakeUp(instance.mountNode.find('> .component.handlebars'), function (comp) {
                    instance.template = comp;
                    next();
                });
            });
        },
        valueDidChange: function (next) {

            this.mountNode.attr('href', this.value.__collectionUrl + '/' + this.value._id);

            this.template.setValue(this.value, next);
        },

        optionsDidChange: function (next) {
            this.template.setOptions(this.options, next);
        },

        serializeOptions: function () {
            return {
                __project: this.__project,
                _id: this._id,
                identifier: this.identifier
            }
        },

        serializeValue: function () {
            return {_id: this.value._id};
        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],14:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');

module.exports = Campsi.extend('component', 'campsi/entry', function ($super) {
    return {


        resolveParam: function (param) {

            if (param === 'project' && this.options.__project) {
                return this.options.__project.identifier || this.options.__project._id;
            }
            if (param === 'collection') {
                return this.options.identifier || this.options._id;
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('form', instance.options, instance.value, function (form) {
                    instance.form = form;
                    instance.mountNode.append(form.render());
                    next();
                });
            });
        },
        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {

                if (typeof instance.nodes.form !== 'undefined') {
                    Campsi.wakeUp(instance.nodes.form[0], function (comp) {
                        instance.form = comp;
                        instance.value.data = comp.value;
                        next();
                    });
                } else {
                    next();
                }
            });
        },

        getNodePaths: function () {
            return {
                form: '> .component.form'
            }
        },

        attachEvents: function () {
            var instance = this;
            instance.form.attachEvents();
            instance.form.bind('change', instance.formChangeHandler.bind(this));
        },

        formChangeHandler: function () {
            this.value.data = this.form.value;
            this.trigger('change');
        },
        optionsDidChange: function (next) {
            this.form.setOptions(this.options, next);
        },
        valueDidChange: function (next) {
            this.form.setValue(this.value.data, next);
            this.trigger('change');
        },

        serializeOptions: function () {
            return {
                __project: this.__project,
                _id: this._id,
                identifier: this.identifier
            }
        },

        getDefaultValue: function () {

            return {
                _id: null,
                _collection: null,
                index: null,
                data: {}
            }
        },
        serializeValue: function () {

            return {
                _id: this.value._id,
                _collection: this.value._collection,
                index: this.value.index,
                data: {}
            }
        },



        loadOptions: function (project, collection, cb) {

            var instance = this;
            var collectionUrl = Campsi.urlApi(project, collection);

            if (instance.collectionUrl === collectionUrl)
                return cb();

            $.getJSON(collectionUrl, function (data) {
                instance.setOptions(data, function () {
                    //instance.form.attachEvents();
                    cb();
                });
            });
        },

        resetModel: function () {
            this.collectionUrl = undefined;
        },

        save: function () {

            var instance = this;
            var collectionUrl = Campsi.urlApi(this.options.__project, this.options);
            var entryUrl = collectionUrl + '/entries/';
            var method = 'POST';
            if (this.value._id) {
                entryUrl += this.value._id;
                method = 'PUT';
            }

            $.ajax({
                url: entryUrl,
                method: method,
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(this.value)
            }).done(function (data) {
                instance.setValue(data, function () {
                    instance.trigger('saved');
                });
            });
        },

        load: function (project, collection, entry, next) {
            var instance = this;
            var collectionUrl = Campsi.urlApi(project, collection);
            var entryUrl = Campsi.urlApi(project, collection, entry);
            var skipOptions = false;
            var skipValue = false;
            var collectionModel;
            var entryData;

            async.parallel([
                function (cb) {
                    if (instance.collectionUrl === collectionUrl) {
                        skipOptions = true;
                        return cb();
                    }

                    $.getJSON(collectionUrl, function (data) {
                        instance.collectionUrl = collectionUrl;
                        collectionModel = data;
                        cb();
                    });
                },
                function (cb) {

                    // todo check if modified ?

                    if (instance.entryUrl === entryUrl) {
                        skipValue = true;
                        return cb();
                    }

                    $.getJSON(entryUrl, function (data) {
                        instance.entryUrl = entryUrl;
                        entryData = data;
                        cb();
                    });
                }
            ], function () {
                async.series([
                    function (cb) {
                        (skipOptions) ? cb() : instance.setOptions(collectionModel, cb);
                    }, function (cb) {
                        (skipValue) ? cb() : instance.setValue(entryData, cb);
                    }, function (cb) {
                        instance.trigger('reset');
                        //instance.form.attachEvents();
                        cb();
                    }], next);
            });
        }


    }
});

},{"async":undefined,"campsi":undefined,"cheerio-or-jquery":undefined}],15:[function(require,module,exports){
var Campsi = require('campsi');

require('./collection/component');
require('./collection-designer/component');
require('./collection-designer/field/component');
require('./collection-list/component');
require('./collection-list/collection/component');
require('./component-chooser/component');
require('./component-chooser/component-options/component');
require('./component-list/component');
require('./entries/component');
require('./entry/component');
require('./entry-list/component');
require('./entry-list/entry/component');
require('./project/component');
require('./project-list/project/component');
require('./user-list/component');
require('./user-list/user/component');
require('./panel/component');
require('./app');
},{"./app":1,"./collection-designer/component":3,"./collection-designer/field/component":4,"./collection-list/collection/component":5,"./collection-list/component":6,"./collection/component":7,"./component-chooser/component":9,"./component-chooser/component-options/component":8,"./component-list/component":10,"./entries/component":11,"./entry-list/component":12,"./entry-list/entry/component":13,"./entry/component":14,"./panel/component":16,"./project-list/project/component":17,"./project/component":18,"./user-list/component":19,"./user-list/user/component":20,"campsi":undefined}],16:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var extend = require('extend');


module.exports = Campsi.extend('component', 'campsi/panel', function ($super) {

    return {

        getDefaultValue: function () {
            return ""
        },

        getDefaultOptions: function () {
            return {
                leftButtons: [{
                    tag: 'a',
                    attr: {href: '/', class: 'back'},
                    content: 'back'
                }],
                rightButtons: [],
                title: 'Untitled Panel',
                id: '',
                classList: ['next']
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.mountNode.addClass('panel');
                instance.mountNode.append('<div class="vmax">' +
                                          '  <div class="row">' +
                                          '     <div class="cell">' +
                                          '         <header>' +
                                          '            <div class="buttons left"></div>' +
                                          '            <h2></h2>' +
                                          '            <div class="buttons right"></div>' +
                                          '         </header>' +
                                          '     </div>' +
                                          '  </div>' +
                                          '  <div class="row hmax">' +
                                          '     <div class="cell scroll">' +
                                          '         <div class="scrollpane">' +
                                          '             <div class="content"></div>' +
                                          '         </div>' +
                                          '     </div>' +
                                          '  </div>' +
                                          '</div>');
                instance.nodes.header = instance.mountNode.find('header');
                instance.nodes.content = instance.mountNode.find('.scrollpane > .content');
                instance.nodes.leftButtons = instance.nodes.header.find('.buttons.left');
                instance.nodes.rightButtons = instance.nodes.header.find('.buttons.right');
                next();
            });
        },

        wakeUp: function (el, next) {
            var instance = this;
            $super.wakeUp.call(this, el, function () {
                if (instance.nodes.content.hasClass('has-component')) {
                    Campsi.wakeUp(instance.nodes.content.find('.component')[0], function (comp) {
                        instance.component = comp;
                        instance.value = comp.value;
                        instance.options.componentOptions = comp.options;
                        instance.options.componentValue = comp.value;
                        next();
                    });
                } else {
                    next();
                }
            });
        },

        attachEvents: function () {
            if (typeof this.component !== 'undefined') {
                this.component.attachEvents();
                this.component.bind('change', this.componentChangeHandler.bind(this));
                this.component.bind('saved', this.componentSavedHandler.bind(this));
                this.component.bind('reset', this.componentResetHandler.bind(this));
            }
            this.nodes.header.on('click', 'button.save', this.saveHandler.bind(this));
        },

        componentChangeHandler: function () {
            this.mountNode.addClass('modified');
            this.value = this.component.value;
            this.setButtonsHref();
            this.trigger('change');
        },

        componentResetHandler: function () {
            this.value = this.component.value;
            this.setButtonsHref();
            this.mountNode.removeClass('modified');
        },
        componentSavedHandler: function () {
            this.mountNode.removeClass('modified');
        },

        saveHandler: function () {
            this.component.save();
        },

        getNodePaths: function () {
            return {
                header: '.vmax > .row > .cell > header',
                content: '.vmax > .row.hmax > .cell.scroll > .scrollpane >.content',
                leftButtons: '.vmax > .row > .cell > header > .buttons.left',
                rightButtons: '.vmax > .row > .cell > header > .buttons.right'
            }
        },

        setButtonsHref: function (buttons, container) {
            var instance = this;


            if (typeof buttons === 'undefined') {
                this.setButtonsHref(this.options.leftButtons, this.nodes.leftButtons);
                this.setButtonsHref(this.options.rightButtons, this.nodes.rightButtons);
                return;
            }


            buttons.forEach(function (btn, i) {
                var href;
                if (typeof btn.attr.href !== 'undefined' && btn.attr.href.indexOf(':') > -1) {
                    href = btn.attr.href.replace(/:[a-z0-9_-]+/ig, function (match) {
                        if(instance.component.resolveParam){
                            return instance.component.resolveParam(match.substring(1));
                        } else {
                            console.info("resolveParam expected in", instance.component.id, "for",match.substring(1));
                        }
                        return '';
                    });

                    container.find('a,button').eq(i).attr('href', href);
                }
            });

        },

        valueDidChange: function (next) {

            this.setButtonsHref();

            if (typeof this.component === 'undefined') {
                this.nodes.content.empty().append(this.value);
                next();
            } else {
                this.mountNode.removeClass('modified');
                this.component.setValue(this.value, next);
            }
        },

        createButton: function (def) {
            var $el = $('<' + def.tag + '>');
            $el.attr(def.attr);
            $el.append(def.content);
            return $el;
        },

        optionsDidChange: function (next) {

            var instance = this;

            instance.id = instance.options.id;

            instance.mountNode.addClass(instance.options.classList.join(' '));
            instance.mountNode.attr('id', instance.options.id);
            instance.nodes.header.find('h2').text(instance.options.title);
            instance.nodes.leftButtons.empty();

            instance.options.leftButtons.forEach(function (btn) {
                instance.nodes.leftButtons.append(instance.createButton(btn));
            });

            instance.nodes.rightButtons.empty();
            instance.options.rightButtons.forEach(function (btn) {
                instance.nodes.rightButtons.append(instance.createButton(btn));
            });

            if (typeof instance.options.component === 'undefined') {
                next();
            } else {
                Campsi.create(
                    instance.options.component,
                    instance.options.componentOptions,
                    instance.value || instance.options.componentValue,
                    function (comp) {
                        instance.component = comp;
                        instance.nodes.content.append(instance.component.render());
                        instance.nodes.content.addClass('has-component');
                        next();
                    });
            }

        },

        serializeValue: function () {
        },

        serializeOptions: function () {
            return {
                leftButtons: this.options.leftButtons,
                rightButtons: this.options.rightButtons
                //title: this.options.title,
                //id: this.options.id,
                //classList: this.options.classList
            }
        }
    }

});
},{"campsi":undefined,"cheerio-or-jquery":undefined,"extend":undefined}],17:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/project-list/project', function ($super) {

    return {

        init: function (next) {

            var instance = this;

            $super.init.call(this, function () {

                instance.nodes.logo = $('<a href="/projects/new" class="logo drag-handle"></a>');
                instance.nodes.title = $('<span class="title"></span>');
                instance.mountNode.append(instance.nodes.logo);
                instance.mountNode.append(instance.nodes.title);

                next();
            })
        },

        getNodePaths: function () {
            return {
                logo: '> a.logo',
                title: '> span.title'
            }
        },

        valueDidChange: function (next) {
            var instance = this;

            instance.mountNode.attr('data-id', instance.value._id);
            var id = (typeof instance.value.identifier === 'undefined') ? instance.value._id : instance.value.identifier;

            instance.nodes.logo.attr('href', '/projects/' + id);
            if (typeof instance.value.icon !== 'undefined') {
                instance.nodes.logo.css('background-image', 'url(' + instance.value.icon.uri + ')');
            }
            instance.nodes.title.text(instance.value.title);

            next();
        }

    }

});
},{"campsi":undefined,"cheerio-or-jquery":undefined}],18:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var page = require('page');

module.exports = Campsi.extend('form', 'campsi/project', function ($super) {

    return {

        getDefaultOptions: function () {

            return {
                fields: [{
                    name: 'title',
                    type: 'text',
                    additionalClasses: ['invisible', 'big-title']
                }, {
                    name: 'identifier',
                    type: 'text',
                    label: 'identifier',
                    additionalClasses: ['identifier']
                },{
                    label: 'Icon',
                    name: 'icon',
                    type: 'file/image',
                    additionalClasses: ['icon']
                },  {
                    name: 'collections',
                    label: 'Collections',
                    type: 'campsi/collection-list',
                    additionalClasses: ['collections']
                }]
            }
        },

        getDefaultValue: function(){
            return {
                collections: []
            }
        },

        resolveParam: function(param){
            if(param === 'project') {
                return this.value.identifier || this.value._id;
            }
        },
        attachEvents: function () {

            $super.attachEvents.call(this);

            var instance = this;

            instance.fields.collections.bind('design', function (id) {
                instance.trigger('design-collection', id);
            });
            instance.fields.collections.bind('admin', function (id) {
                instance.trigger('admin-collection', id);
            });
            instance.fields.collections.bind('create-collection', function (template) {
                console.info("createCollections");

                $.ajax({
                    url: '/api/v1/projects/' + instance.value._id + '/collections',
                    method: 'POST',
                    contentType: 'application/json'
                }).done(function (data) {
                    instance.value.collections.push(data);
                    instance.fields.collections.setValue(instance.value.collections, function () {
                        page('/projects/' + instance.value._id + '/collections/' + data._id); // dispatch global event
                    });
                });
            });
        },

        valueDidChange: function(next){
            var instance = this;
            this.value.collections.forEach(function(collection){
                collection.__project = {
                    _id: instance.value._id,
                    identifier: instance.value.identifier
                };
            });
            $super.valueDidChange.call(this, next);
        },

        load: function (id, next) {
            var instance = this;
            var projectUrl = '/api/v1/projects/' + id;
            $.getJSON(projectUrl, function (data) {
                instance.setValue(data, function () {
                    instance.trigger('reset');
                    next();
                });
            });
        },

        save: function () {

            var instance = this;
            var projectUrl = '/api/v1/projects';
            var method = 'POST';

            if (instance.value.id) {
                projectUrl += '/' + instance.value.id;
                method = 'PUT';
            }

            $.ajax({
                url: projectUrl,
                method: method,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.value)
            }).done(function (data) {
                instance.value = data;
                instance.trigger('saved');
            }).error(function () {
                instance.trigger('save-error');
            });
        },

        serializeValue: function () {
            return {
                _id: this.value._id,
                identifier: this.value.identifier
            }
        },

        serializeOptions: function () {
        }
    }

});
},{"campsi":undefined,"cheerio-or-jquery":undefined,"page":undefined}],19:[function(require,module,exports){
var Campsi = require('campsi');

module.exports = Campsi.extend('array', 'campsi/user-list', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                removeButton: false,
                newItem: true,
                items: {
                    type: 'campsi/user-list/user'
                }
            }
        },

        getNodePaths: function () {
            return $.extend({}, $super.getNodePaths(), {
                'newItemForm': '> .items > .newItem'
            });
        },


        optionsDidChange: function(next){
            var instance = this;
            $super.optionsDidChange.call(this, function(){
                instance.nodes.items.append(instance.nodes.newItemForm);
                next();
            });
        }
    }
});
},{"campsi":undefined}],20:[function(require,module,exports){
var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/user-list/user', function ($super) {

    return {

        getDefaultValue: function(){
            return {
                name: 'Add user',
                picture: 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/128/user.png'
            }
        },

        init: function (next) {

            var instance = this;
            var defaultValue = this.getDefaultValue();
            $super.init.call(this, function () {

                instance.nodes.image = $('<img>').attr('src', defaultValue.picture);
                instance.nodes.avatar = $('<div class="avatar drag-handle"></div>');
                instance.nodes.avatar.append(this.nodes.image);
                instance.nodes.name = $('<div class="name"></div>').text(defaultValue.name);
                instance.mountNode.append(instance.nodes.avatar);
                instance.mountNode.append(instance.nodes.name);
                next.call();
            });
        },

        getNodePaths: function () {
            return {
                avatar: '> .avatar',
                image: '> .avatar > img',
                name: '> .name'
            }
        },

        valueDidChange: function (next) {

            var instance = this;
            $super.valueDidChange.call(this, function () {
                instance.nodes.image.attr('src', instance.value.picture);
                instance.nodes.name.text(instance.value.name);
                next.call();
            });

        }
    }
});
},{"campsi":undefined,"cheerio-or-jquery":undefined}]},{},[15]);
