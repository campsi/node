var isBrowser = require('is-browser');

module.exports = (isBrowser) ? $ : require('cheerio').load('');