var express = require('express');
var browserConfig = require('../../browser-config');
var translations = require('./translations');
var routes = require('./routes');
var resources = require('../../middleware/resources');
var async = require('async');
var toObject = require('./server/docToObject');
var router = express.Router();
var version = require('../../package.json').version;

resources.patchRouter(router);

router.get('/*', function (req, res, next) {
    req.campsiApp = require('./app')({
        locale: req.locale,
        config: browserConfig,
        user: req.user,
        req: req
    });

    require('./server/loader')(req.campsiApp);
    next();
});

var load = function (resources) {

    return function (req, res, next) {
        var app = req.campsiApp;

        app.redirect = function (url) {
            res.redirect(url)
        };

        async.forEachSeries(resources, function (resource, cb) {
            if (req[resource]) {
                app.getResource(resource).setData(toObject(req[resource]), cb);
            } else {
                app.getResource(resource).getData(undefined, function () {
                    cb();
                });
            }
        }, next);
    }
};

var render = function (layout) {
    return function (req, res, next) {
        req.campsiApp.render(layout, function (panels) {
            req.panels = panels;
            next();
        });
    }
};

var send = function (req, res) {
    res.render('index', {
        version: version,
        panels: req.panels,
        user: req.user,
        config: browserConfig,
        context: req.campsiApp.serialize(),
        translations: translations[req.locale]
    });
};

routes.forEach(function (route) {
    router.get(route.path, load(route.resources), route.onEnterServer.bind(route), render(route.layout), send)
});

module.exports = router;