'use strict';
var Campsi = require('campsi-core');
var isBrowser = require('is-browser');
var Panel = function (options) {
    this.options = options;
    this.value = {};
    this.visible = false;
};
Panel.prototype.wakeUp = function (context, callback) {
    var instance = this;
    Campsi.wakeUp(document.getElementById(this.options.id), context, function (panelComponent) {
        panelComponent.attachEvents();
        instance.component = panelComponent;
        callback();
    });
};
Panel.prototype.create = function (context, callback) {
    var instance = this;
    Campsi.create('campsi/panel', {
        options: this.options,
        context: context
    }, function (panelComponent) {
        instance.component = panelComponent;
        instance.component.setButtonsHref();
        instance.component.setSavedValue(instance.componentValue, callback);
    });
};
Panel.prototype.setValue = function (value, callback) {
    this.componentValue = value;
    if (!isBrowser) {
        return callback();
    }
    this.setVisible(this.visible, callback);
};
Panel.prototype.setVisible = function (isVisible, callback) {
    this.visible = isVisible;
    if (this.visible) {
        this.component.setSavedValue(this.componentValue, callback);
    } else {
        callback();
    }
};
Panel.prototype.getValue = function (value) {
    if (!isBrowser) {
        this.componentValue = value;
        return this.componentValue;
    }
    return this.component.value;
};
Panel.prototype.setOptions = function (options, callback) {
    if (!isBrowser) {
        this.options = options;
        return callback();
    }
    this.component.setOptions(options, callback);
};
Panel.prototype.setComponentOptions = function (options, callback) {
    if (!isBrowser) {
        this.options.componentOptions = options;
        return callback();
    }
    this.component.component.setOptions(options, callback);
};
Panel.prototype.addClass = function (className) {
    if (isBrowser) {
        this.component.mountNode.addClass(className);
    } else {
        this.createClassList();
        this.options.classList.push(className);
    }
};
Panel.prototype.createClassList = function () {
    if (typeof this.options.classList === 'undefined') {
        this.options.classList = [];
    }
};
Panel.prototype.removeClass = function (className) {
    if (isBrowser) {
        return this.component.mountNode.removeClass(className);
    }    //todo server ? est-ce utile ?
};
Panel.prototype.render = function () {
    if (typeof this.component === 'undefined') {
        return this.options.id;
    }
    return isBrowser ? this.component.render() : require('cheerio').html(this.component.render());
};
module.exports = Panel;