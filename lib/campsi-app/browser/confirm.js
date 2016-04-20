'use strict';
var $ = require('cheerio-or-jquery');
module.exports = function (options, cb) {
    var $confirm = $('#confirm');
    $confirm.find('h1').text(options.header);
    $confirm.find('p').text(options.message);
    $confirm.find('button.confirm').text(options.confirm);
    $confirm.find('button.cancel').text(options.cancel);
    $('#modal').show();
    $confirm.show().find('form').off('submit').on('submit', function (e) {
        cb($(this).hasClass('confirm'));
        $confirm.hide();
        $('#modal').hide();
        e.preventDefault();
    }).filter('.cancel').find('button').focus();
};