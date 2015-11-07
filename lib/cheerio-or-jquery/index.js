var isBrowser = require('is-browser');
var cheerio;
try {
    cheerio = require('cheerio');
} catch (err) {
    cheerio = function () {

    }
}

if (!isBrowser) {

    var noop = ['on', 'off', 'bind'];

    noop.forEach(function(methodName){
        cheerio.prototype[methodName] = function(){}
    });
    cheerio.prototype.toggle = function (force) {
        this.toggleClass('hidden', !force);
    };

    cheerio.prototype.hide = function(){
        this.toggle(false);
    };

    cheerio.prototype.show = function(){
        this.toggle(true);
    };
    cheerio.prototype.extend = require('extend');
}

module.exports = (isBrowser) ? $ : require('cheerio').load('');