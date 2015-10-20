(function () {

    //lib
    var Campsi = require('campsi');
    var $ = require('cheerio-or-jquery');
    var async = require('async');
    var page = require('page');

    // components
    var codeEditor = require('./code-editor');
    var loader = require('./loader');
    var signin = require('./auth');
    var dnd = require('./dnd');

    // vars
    var panelComponents = {};

    Campsi.openCodeEditor = codeEditor.open;
    Campsi.drake = dnd;

    $(function () {
        $(document).on('focusout', function (e) {
            requestAnimationFrame(function () {
                $('.vmax').each(function (i, el) {
                    el.scrollTop = 0;
                });
                $('#app > .panels')[0].scrollLeft = 0;
            })
        }).on('dblclick', '.component.campsi_collection-designer_field header', function () {
            $(this).closest('.component').toggleClass('closed')
        }).on('click', '#code-editor-container button.validate', function () {
            codeEditor.change(codeEditor.instance.getValue());
            codeEditor.close();
        }).on('click', '#code-editor-container button.close', codeEditor.close);

        $('.cell.scroll').on('scroll', function () {
            $(this).closest('.panel').toggleClass('scroll', (this.scrollTop > 0));
        });

        $('.login').click(signin);
    });

    loader(function () {

        panelComponents = require('./browser-routes')(page);

        console.info("every component loaded");
        async.forEach($('.panel'), function (el, cb) {
            console.info("waking up", el.id);
            Campsi.wakeUp(el, function (comp) {
                console.info("woken up", el.id);
                comp.attachEvents();
                panelComponents[comp.id] = comp;
                cb();
            });
        }, function () {
            console.info("every panel woken up");
        });
    })


})();