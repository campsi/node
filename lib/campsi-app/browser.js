var app = require('./app')(window.CAMPSI_CONTEXT);
var page = require('page');
var $ = require('cheerio-or-jquery');
var loader = require('./browser/loader');
var layout = require('./browser/layout')(app);
var Resource = require('./resource');
var Campsi = require('campsi-core');
var auth = require('./browser/auth');
var confirm = require('./browser/confirm');
Campsi.drake = require('./browser/dnd');

var analytics = require('./browser/analytics');

if (window.CAMPSI_USER) {
    analytics.identify(window.CAMPSI_USER._id);
}

analytics.page();

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

app.redirect = function (url) {
    page(url);
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

var sendPageView = function(ctx, next){
    window.analytics.page(ctx.pathname);
    next();
};

var prevState = new page.Context(window.location.pathname);


var checkForModifications = function (ctx, next) {
    if ($('.panel.main').hasClass('modified') && prevState.path !== ctx.path) {
        // todo check si next == properties pour ne pas afficher de confirm
        ctx.handled = false;
        confirm({
            header: ctx.campsiApp.translate('confirm.exitWithChanges.header'),
            message: ctx.campsiApp.translate('confirm.exitWithChanges.message'),
            confirm: ctx.campsiApp.translate('confirm.exitWithChanges.confirm'),
            cancel: ctx.campsiApp.translate('confirm.exitWithChanges.cancel')
        }, function (confirmed) {
            if (confirmed) {
                ctx.pushState();
                next();
            } else {
                layout.updateLinks(prevState.path);
            }
        });
    } else {
        ctx.handled = true;
        next();
    }
};


var endRoute = function (ctx) {
    ctx.handled = true;
    prevState = ctx.state;
};


loader(function () {
    app.wakeUpPanels(function () {

        page('/*', updateLinks, function (ctx, next) {
            ctx.campsiApp = app;
            next();
        });

        app.routes.forEach(function (route) {
            page(route.path,
                checkForModifications,
                layout.loading.show,
                load(route.resources),
                layout.next(route.layout),
                route.onEnterBrowser.bind(route),
                layout.exec,
                layout.loading.hide,
                updateLinks,
                sendPageView,
                endRoute
            );
        });

        //page('*', function (ctx) {
        //    console.info('page not found', ctx);
        //});

        page({dispatch: false});
    });
});

$(function () {
    require('./browser/domReady');
});

layout.updateLinks(window.location.pathname);

window.page = page;
window.app = app;