'use strict';
var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var confirm = require('../../campsi-app/browser/confirm');
var equals = require('equals');
var deepCopy = require('deepcopy');
var raf = require('raf');

var removeUndefinedProps = function (obj) {
    if (typeof obj !== 'object') {
        return obj;
    }
    var typeofProp;
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            typeofProp = typeof obj[prop];
            if (typeofProp === 'undefined' || prop === '__v') {
                delete obj[prop];
            } else if (typeofProp === 'object') {
                removeUndefinedProps(obj[prop]);
            }
        }
    }
    return obj;
};
module.exports = Campsi.extend('component', 'campsi/panel', function ($super) {
    return {
        getDefaultValue: function () {
        },
        getDefaultOptions: function () {
            return {
                title: 'Untitled Panel',
                id: '',
                theme: 'light',
                classList: ['next'],
                nav: [],
                actions: []
            };
        },
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                instance.mountNode.append('<header>'
                    + '    <h2></h2>'
                    + '    <nav></nav>'
                    + ' </header>'
                    + ' <div class="content"></div>'
                    + ' <div class="actions"></div>');
                instance.nodes.header = instance.mountNode.find('> header');
                instance.nodes.nav = instance.mountNode.find('> header > nav');
                instance.nodes.content = instance.mountNode.find('> .content');
                instance.nodes.actions = instance.mountNode.find('> .actions');
                next();
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                if (instance.nodes.content.hasClass('has-component')) {
                    Campsi.wakeUp(instance.nodes.content.find('.component')[0], context, function (comp) {
                        if (instance.options.context) {
                            comp.value = instance.context[instance.options.context];
                        }
                        instance.component = comp;
                        instance.value = comp.value;
                        instance.savedValue = deepCopy(instance.value);
                        instance.component.savedValue = instance.savedValue;
                        instance.options.componentOptions = comp.options;
                        instance.options.componentValue = comp.value;
                        next();
                    });
                } else {
                    next();
                }
            });
        },
        setSavedValue: function (value, cb) {
            var instance = this;
            try {
                this.savedValue = deepCopy(value);
                this.component.savedValue = this.savedValue;
            } catch (err) {
                console.error(err);
            }
            this.setValue(value, function () {
                instance.mountNode.removeClass('modified');
                cb();
            }, false);
        },
        attachEvents: function () {
            var instance = this;
            if (typeof this.component !== 'undefined') {
                this.component.attachEvents();
                this.component.bind('change', this.componentChangeHandler.bind(this));
                this.component.bind('saved', this.componentSavedHandler.bind(this));
                this.component.bind('reset', this.componentResetHandler.bind(this));
                this.component.bind('*', function (event) {
                    if ([
                            'change',
                            'saved',
                            'reset'
                        ].indexOf(event.name) === -1) {
                        instance.forward(event);
                    }
                });
            }
            this.nodes.actions.on('click', 'button.save', this.saveClickHandler.bind(this));
            this.nodes.actions.on('click', 'button.delete', this.deleteClickHandler.bind(this));
            this.nodes.actions.on('click', 'button.publish', this.publishClickHandler.bind(this));
        },
        componentChangeHandler: function () {
            var instance = this;
            this.setValue(this.component.value, function () {
                instance.toggleModified();
                instance.setButtonsHref();
            }, false);
        },
        componentResetHandler: function () {
            var instance = this;
            this.setValue(this.component.value, function () {
                instance.setButtonsHref();
                instance.mountNode.removeClass('modified');
            });
        },
        componentSavedHandler: function () {
            this.savedValue = deepCopy(this.value);
            this.mountNode.removeClass('modified new');
        },
        saveClickHandler: function () {
            this.component.save();
        },
        publishClickHandler: function () {
            this.component.publish();
        },
        deleteClickHandler: function () {
            var comp = this.component;
            confirm({
                header: this.context.translate('confirm.deletion.header'),
                message: this.context.translate('confirm.deletion.message'),
                confirm: this.context.translate('confirm.deletion.confirm'),
                cancel: this.context.translate('confirm.deletion.cancel')
            }, function (confirmed) {
                if (confirmed) {
                    comp.delete();
                }
            });
        },
        getNodePaths: function () {
            return {
                header: '> header',
                content: '> .content',
                actions: '> .actions',
                nav: '> header > nav'
            };
        },
        setButtonsHref: function () {
            var instance = this;
            instance.mountNode.find('> header a[href]').each(function () {
                var href = $(this).data('href');
                if (href) {
                    $(this).attr('href', instance.context.applicationURL(href));
                }
            });
        },
        valueDidChange: function (next) {
            this.toggleModified();
            this.setButtonsHref();
            if (typeof this.component === 'undefined') {
                this.nodes.content.empty().append(this.value);
                next();
            } else {
                this.component.setValue(this.value || this.component.getDefaultValue(), next, false);
            }
        },
        toggleModified: function () {
            var modified = !equals(this.savedValue, this.value);
            this.mountNode.toggleClass('modified', modified);
        },

        setTitle: function (newTitle) {
            if (typeof newTitle === 'undefined') {
                newTitle = this.options.title;
            }
            this.nodes.header.find('h2').text(newTitle);
        },

        renderNav: function () {
            var instance = this;

            instance.nodes.nav.empty();
            var els = [];
            instance.options.nav.forEach(function (href) {
                els.push(
                    $('<a>')
                        .text(instance.context.translate('nav.' + instance.options.id + '.' + href))
                        .attr('href', instance.context.applicationURL(href))
                        .attr('data-href', href)
                );
            });
            instance.nodes.nav.append(els);
        },

        renderActions: function(){

            var instance = this;

            instance.nodes.actions.empty();
            var els = [];
            instance.options.actions.forEach(function (action) {
                els.push(
                    $('<button>')
                        .addClass(action)
                        .text(instance.context.translate('actions.' + instance.options.id + '.' + action))
                );
            });
            instance.nodes.actions.append(els);
        },

        optionsDidChange: function (next) {
            var instance = this;
            instance.id = instance.options.id;
            instance.mountNode.addClass(instance.options.classList.join(' '));
            instance.mountNode.addClass(instance.options.theme);
            instance.mountNode.attr('id', instance.options.id);
            instance.nodes.header.find('h2').text(instance.options.title);

            instance.renderActions();
            instance.renderNav();

            if (typeof instance.options.component === 'undefined') {
                next();
            } else {
                Campsi.create(instance.options.component, {
                    options: instance.options.componentOptions,
                    value: instance.options.componentValue,
                    context: instance.context
                }, function (comp) {
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
        }
    };
});