var isBrowser = require('is-browser');
var cheerio;
try {
    cheerio = require('cheerio');
} catch (err) {
    cheerio = function () {

    }
}

var outerHtml = function () {
    return this.clone().wrap('<div>').parent().html()
};

if (!isBrowser) {

    var noop = ['on', 'off', 'bind'];

    noop.forEach(function (methodName) {
        cheerio.prototype[methodName] = function () {
        }
    });
    cheerio.prototype.toggle = function (force) {
        if(force === false){
            this.attr('style', 'display:none;');
        }
        this.toggleClass('hidden', !force);
    };

    cheerio.prototype.hide = function () {
        this.toggle(false);
    };

    cheerio.prototype.show = function () {
        this.toggle(true);
    };

    cheerio.prototype.prop = cheerio.prototype.attr;
    cheerio.prototype.extend = require('extend');

    cheerio.prototype.outerHtml = outerHtml;
} else {
    $.fn.outerHtml = outerHtml;
}


//.clone().wrap('<div>').parent().html()
module.exports = (isBrowser) ? $ : require('cheerio').load('');