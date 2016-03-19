var auth = require('./auth');
var utils = require('./utils');
var page = require('page');

console.info("domReady");

$(document).on('focusout focus', function () {
    requestAnimationFrame(function () {
        $('.vmax').each(function (i, el) {
            el.scrollTop = 0;
        });
        $('#app').find('> .panels')[0].scrollLeft = 0;
        utils.resetScroll();
    });
}).on('dblclick', '.component.campsi_collection-designer_field header', function () {
    $(this).closest('.component').toggleClass('closed')
}).on('keyup', 'input', function (e) {
    e.stopPropagation();
}).on('click', 'button.logout', function () {
    page('/logout')
});

$('.cell.scroll').on('scroll', function () {
    $(this).closest('.panel').toggleClass('scroll', (this.scrollTop > 0));
});

$('.panel > .content').on('scroll', function () {
    var panelContent = this;
    var panel = $(panelContent).closest('.panel');
    var scrollTop = this.scrollTop;

    requestAnimationFrame(function () {
        panel.toggleClass('scroll', (scrollTop > 0));
    })
}).on('touchmove', function (e) {
    e.stopPropagation();
});

$('.login').click(function () {
    auth('login')
});
$('.signup').click(function () {
    auth('signup')
});
