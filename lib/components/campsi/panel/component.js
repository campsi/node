var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var extend = require('extend');
var isBrowser = require('is-browser');


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
                    content: 'back',
                    icon: 'angle-left'
                }],
                rightButtons: [],
                title: 'Untitled Panel',
                id: '',
                classList: ['next']
            }
        },

        context: function (context) {
            this.context = (typeof this.context === 'undefined') ? {} : this.context;

            if (typeof context !== 'undefined') {
                this.context = extend(this.context, context);
                if (typeof this.component !== 'undefined') {
                    this.component.context = this.context;
                }
            }
            return this.context;
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
            this.nodes.header.on('click', 'button.delete', this.deleteHandler.bind(this));
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
        deleteHandler: function () {
            if (confirm('At the moment, the deletion is definitive, continue ?')) {
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
                var href;
                if (typeof btn.attr.href !== 'undefined' && btn.attr.href.indexOf(':') > -1) {
                    href = btn.attr.href.replace(/:[a-z0-9_-]+/ig, function (match) {
                        if (instance.component.resolveParam) {
                            return instance.component.resolveParam(match.substring(1));
                        } else {
                            console.info("resolveParam expected in", instance.component.id, "for", match.substring(1));
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
            if (def.icon) {
                $el.append($('<i>').addClass('fa fa-' + def.icon))
            }
            $el.append($('<span>').text(def.content));

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
                if (isBrowser) {

                } else {
                    instance.nodes.content.html(instance.options.content);
                }
                next();
            } else {
                Campsi.create(
                    instance.options.component,
                    extend(instance.options.componentOptions, {context: instance.options.context}),
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