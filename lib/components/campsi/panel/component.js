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
                leftButtons: [],
                rightButtons: [],
                title: 'Untitled Panel',
                id: '',
                classList: []
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
            }
            this.nodes.header.on('click', 'button.save', this.saveHandler.bind(this));
        },

        componentChangeHandler: function () {
            this.mountNode.addClass('modified');
            this.value = this.component.value;
            this.trigger('change');
        },

        componentSavedHandler: function () {
            this.mountNode.removeClass('modified');
            this.trigger('reload-projects');
        },

        saveHandler: function () {
            this.component.save();
        },

        getNodePaths: function () {
            return {
                header: '.vmax > .row > .cell > header',
                content: '.vmax > .row.hmax > .cell.scroll > .scrollpane >.content',
                leftButtons: '.vmax > .row > .cell > .header > .buttons.left',
                rightButtons: '.vmax > .row > .cell > .header > .buttons.right'
            }
        },

        valueDidChange: function (next) {
            if (typeof this.component === 'undefined') {
                this.nodes.content.empty().append(this.value);
                next();
            } else {
                this.mountNode.removeClass('modified');
                this.component.setValue(this.value, next);
            }
        },

        optionsDidChange: function (next) {
            var instance = this;

            instance.options = extend({}, instance.getDefaultOptions(), instance.options);

            instance.id = instance.options.id;

            instance.mountNode.addClass(instance.options.classList.join(' '));
            instance.mountNode.attr('id', instance.options.id);

            instance.nodes.header.find('h2').text(instance.options.title);
            instance.nodes.leftButtons.empty();
            instance.options.leftButtons.forEach(function (btn) {
                instance.nodes.leftButtons.append(btn);
            });

            instance.nodes.rightButtons.empty();
            instance.options.rightButtons.forEach(function (btn) {
                instance.nodes.rightButtons.append(btn);
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
            return;
        },

        serializeOptions: function () {
            return;
        }
    }

});