var Campsi = (function () {

    var refCount = 0;

    /**
     * Base class for every component
     * @constructor
     */
    var Component = function () {
        this.callbacks = {change: [], error: []};
    };

    Component.prototype = Object.create({

        withLabel:      true,
        withErrors:     true,
        withHelp:       true,
        defaultValue:   null,
        defaultOptions: {props: {}, additionalClasses: []},
        previousValue:  null,

        init: function (options, value, context, callback) {

            this.options      = $.extend({}, this.defaultOptions, options);
            this.defaultValue = options.default || this.defaultValue;
            this.value        = value || JSON.parse(JSON.stringify(this.defaultValue));
            this.context      = context || value;
            this.modifiers    = [];
            this.errors       = [];

            callback.call(this, this);
        },

        prop: function (name, returnIfUndefined) {
            return this.options.props[name] || returnIfUndefined;
        },

        createInitialDomElements: function () {
            var d = this.dom = {},
                id = this.name + '-' + refCount;

            refCount++;

            d.root = $('<div class="field component">').addClass(this.name).attr('id', id);

            if (this.options.additionalClasses) {
                d.root.addClass(this.options.additionalClasses.join(' '))
            }

            d.root.data('component', this);

            if (this.withLabel && this.options.label) {
                d.label = $('<div class="label">');
                d.label.append('<span>').text(this.options.label);
                d.root.append(d.label);
            } else {
                d.root.addClass('without-label');
            }

            if (this.withHelp && this.options.help) {
                d.help = $('<div class="help">');
                d.root.append(d.help);
            }

            if (this.options.required && this.options.required === true) {
                d.root.append($('<span class="required">*</span>'));
                d.root.addClass('required');
            }

            if (this.options.layout) {
                d.root.addClass('layout-' + this.options.layout);
            }

            d.control = $('<div class="control">');
            d.root.append(d.control);

            if (this.withErrors) {
                d.errors = $('<div class="errors">');
                d.root.append(d.errors);
            }
        },
        val:                      function (value) {
            if (arguments.length == 0) {
                return this.value;
            }

            if (this.value) {
                this.previousValue = JSON.parse(JSON.stringify(this.value));
            }
            //this.valueHistory.push(this.previousValue);
            this.value = this.process(value);

            this.update();

            return this;
        },
        process:                  function (value) {

            var errorsRef = this.dom.errors.empty();

            this.errors.length = 0;

            this.validate(value);

            if (this.errors.length > []) {
                this.dom.root.addClass('error');
                this.trigger('error');

                errorsRef.append(this.errors.map(function (err) {
                    return $('<p>').text(err.message);
                }));

                return value;
            } else {
                this.dom.root.removeClass('error');
            }
            return this.applyModifiers(value);
        },
        validate:                 function (value) {
            if (this.options.required) {
                this.addError(String(value) === '', 'Missing required field');
            }
        },
        addError:                 function (condition, message) {
            if (condition) {
                this.errors.push(new Error(message));
            }
        },
        applyModifiers:           function (value) {
            return value;
        },
        focus:                    function () {
            this.dom.control.find('select,input')[0].focus();
        },
        on:                       function (eventName, callback) {
            if (!this.callbacks[eventName]) {
                this.callbacks[eventName] = [];
            }

            this.callbacks[eventName].push(callback);
        },
        trigger:                  function (eventName) {
            if (!this.callbacks[eventName]) {
                return;
            }

            var i = 0, length = this.callbacks[eventName].length;
            for (i; i < length; i++) {
                this.callbacks[eventName][i].call(this);
            }
        },
        createDOM:                function () {

        },

        attachEvents: function () {

        },

        html:               function () {
            this.createInitialDomElements();
            this.createDOM();
            this.attachEvents();
            this.update();
            return this.dom.root[0];
        },
        update:             function () {

        },
        getDesignerFields:  function () {

        },
        getPropsFormFields: function () {
            return [];
        }
    });
    return {
        components: (function () {
            var map = this.components = {
                component: Component
            };

            var callbacks = {};

            var get = function (name, onLoad) {
                if (name == undefined) {
                    throw new Error('undefined component name');
                }
                if ($.isFunction(map[name])) {
                    onLoad.call(this, map[name]);
                } else if ($.isArray(callbacks[name])) {
                    callbacks[name].push(function () {
                        onLoad.call(this, map[name]);
                    });
                } else {
                    callbacks[name] = [function () {
                        onLoad.call(this, map[name])
                    }];
                    Campsi.loader.js('/components/' + name + '/component.js');
                }
            };

            var add = function (prototypeFactory) {
                extend('component', prototypeFactory);
            };

            var extend = function (parentName, prototypeFactory) {

                get(parentName, function (Parent) {
                    var prototype = prototypeFactory(Parent.prototype),
                        component = function () {
                            Parent.call(this);
                        };

                    component.prototype = Object.create($.extend({}, Parent.prototype, prototype));

                    component.constructor = Parent;

                    map[prototype.name] = component;

                    if (prototype.style) {
                        $(prototype.style).each(function (i, href) {
                            Campsi.loader.css('components/' + prototype.name + '/' + href);
                        });

                    }

                    if ($.isArray(callbacks[prototype.name])) {
                        var i = 0, l = callbacks[prototype.name].length;
                        for (; i < l; i++) {
                            callbacks[prototype.name][i].call(this, map[prototype.name]);
                        }
                    }
                });
            };

            var create = function (options, value, context, onLoad) {
                get(options.type, function (componentFactory) {
                    var component = new componentFactory();
                    component.init(options, value, context, onLoad);
                });
            };


            return {
                map:    map,
                get:    get,
                add:    add,
                create: create,
                extend: extend
            }
        })()
    }
})();
