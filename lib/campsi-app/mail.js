'use strict';
var jade = require('jade');
var i18n = require('i18n');
var path = require('path');
var config = require('../../config');
var extend = require('extend');
var sendgrid = require('sendgrid')(config.sendgrid_api_key);
var debug = false;
var Mail = function (template, locale, params) {
    this.params = params;
    this.locale = locale;
    this.fn = jade.compileFile(path.join(__dirname, '../../views/email/') + template + '.jade');
    i18n.configure({
        locales: [
            'en',
            'fr'
        ],
        directory: path.join(__dirname, '../../locales'),
        register: this.params
    });
};
Mail.defaults = { from: 'support@campsi.io' };
Mail.prototype.send = function (callback) {
    i18n.setLocale(this.params, this.locale);
    var options = extend({}, Mail.defaults, this.params);
    options.subject = this.params.__(options.subject);
    options.html = this.fn(this.params);
    if (debug) {
        console.info(options);
        return callback();
    }
    sendgrid.send(options, function (err) {
        callback(err);
    });
};
module.exports = Mail;