var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

$(function () {

    Campsi.wakeUp($('#contact > form > .component')[0], {}, function (contactFormComponent) {
        contactFormComponent.attachEvents();

        $('#contact').submit(function () {
            $.ajax({
                url: '/api/v1/users/me',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(contactFormComponent.value)
            }).done(function(){
                console.info('modified');
            });
            return false;
        });
    });



});