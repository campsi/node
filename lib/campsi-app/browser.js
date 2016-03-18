var app = require('./app')(window.CAMPSI_CONTEXT);
var page = require('page');
var $ = require('cheerio-or-jquery');
var loader = require('./browser/loader');
var layout = require('./browser/layout')(app);
var Resource = require('./resource');
var Campsi = require('campsi-core');
Campsi.drake = require('./browser/dnd');

Resource.prototype.load = function (url, callback) {

    if (typeof url === 'undefined') {
        return callback();
    }

    $.getJSON(url, function (data) {
        callback(null, data);
    }).fail(function (err) {
        callback(err);
    });
};

var load = function (resources) {
    return function (ctx, next) {
        app.load(resources, ctx.params, next);
    }
};

var updateLinks = function (ctx, next) {
    layout.updateLinks(ctx.path);
    next();
};

var endRoute = new Function();

loader(function () {
    app.wakeUpPanels(function () {

        page('/*', updateLinks, function (ctx, next) {
            ctx.campsiApp = app;
            next();
        });

        app.routes.forEach(function (route) {
            page(route.path,
                layout.loading.show,
                layout.next(route.layout),
                load(route.resources),
                route.onEnterBrowser.bind(route),
                updateLinks,
                layout.exec,
                layout.loading.hide,
                endRoute
            );
        });

        page('*', function (ctx) {
            console.info("page not found", ctx);
        });

        page({dispatch: false});
    });
});

$(function () {
    require('./browser/domReady');
});

layout.updateLinks(window.location.pathname);

window.page = page;
window.app = app;