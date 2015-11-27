var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var isBrowser = require('is-browser');
var equals = require('equals');
var deepCopy = require('deepcopy');
var removeUndefinedProps = function (obj) {
    var ret = {};
    var typeofProp;
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            typeofProp = typeof obj[prop];
            if (typeofProp === 'undefined') {
                delete obj[prop]
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
                leftButtons: [{
                    tag: 'a',
                    attr: {href: 'root', class: 'back'},
                    content: this.context.translate('btns.back'),
                    icon: 'angle-left'
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
                instance.mountNode.append('<header>' +
                    '    <div class="buttons left"></div>' +
                    '    <div class="buttons right"></div>' +
                    '    <h2></h2>' +
                    ' </header>' +
                    ' <div class="content"></div>');
                instance.nodes.header = instance.mountNode.find('> header');
                instance.nodes.content = instance.mountNode.find('> .content');
                instance.nodes.leftButtons = instance.nodes.header.find('.buttons.left');
                instance.nodes.rightButtons = instance.nodes.header.find('.buttons.right');
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
            this.savedValue = deepCopy(value);
            this.setValue(value, cb, false);
        },

        attachEvents: function () {
            if (typeof this.component !== 'undefined') {
                this.component.attachEvents();
                this.component.bind('change', this.componentChangeHandler.bind(this));
                this.component.bind('saved', this.componentSavedHandler.bind(this));
                this.component.bind('reset', this.componentResetHandler.bind(this));
            }
            this.nodes.header.on('click', 'button.save', this.saveClickHandler.bind(this));
            this.nodes.header.on('click', 'button.delete', this.deleteClickHandler.bind(this));
            this.nodes.header.on('click', 'button.publish', this.publishClickHandler.bind(this));
        },

        componentChangeHandler: function () {
            var instance = this;
            this.setValue(this.component.value, function () {
                if (!equals(removeUndefinedProps(instance.savedValue), removeUndefinedProps(instance.value))) {
                    console.info("IT'S FUCKING DIFFERENT", instance.savedValue, instance.value);
                    instance.mountNode.addClass('modified');
                } else {
                    instance.mountNode.removeClass('modified');
                }
                instance.setButtonsHref();
            });
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
            this.mountNode.removeClass('modified');
        },

        saveClickHandler: function () {
            this.component.save();
        },

        publishClickHandler: function () {
            this.component.publish();
        },

        deleteClickHandler: function () {
            if (confirm(instance.context.translate('deleteWarning'))) {
                this.component.delete();
            }
        },

        getNodePaths: function () {
            return {
                header: '> header',
                content: '> .content',
                leftButtons: '> header > .buttons.left',
                rightButtons: '> header > .buttons.right'
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
                if (typeof btn.attr.href !== 'undefined') {
                    container.find('a,button').eq(i).attr('href', instance.context.applicationURL(btn.attr.href));
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
                this.component.setValue(this.value || this.component.getDefaultValue(), next, false);
            }
        },

        createButton: function (def) {
            var $el = $('<' + def.tag + '>');
            $el.attr(def.attr);
            if (def.icon) {
                $el.append($('<i>').addClass('fa fa-' + def.icon))
            }
            $el.append($('<span>').text(def.content));

            return $el;
        },

        optionsDidChange: function (next) {

            var instance = this;

            if (instance.options.context) {
                context = instance.options.context;
            }

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
                if (isBrowser) {

                } else {
                    instance.nodes.content.html(instance.options.content);
                }
                next();
            } else {
                Campsi.create(instance.options.component, {
                    options: instance.options.componentOptions,
                    value: instance.options.componentValue, //todo bug potentiel
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
            return {
                leftButtons: this.options.leftButtons,
                rightButtons: this.options.rightButtons,
                context: this.options.context
            }
        }
    }

});