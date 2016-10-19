'use strict';
var express = require('express');
var browserConfig = require('../../browser-config');
var translations = require('./translations');
var resources = require('../../middleware/resources');
var async = require('async');
var toObject = require('./server/docToObject');
var router = express.Router();
var version = require('../../package.json').version;
resources.patchRouter(router);

router.use(function (req, res, next) {
    req.campsiApp = require('./app')({
        locale: req.locale,
        config: browserConfig,
        user: req.user,
        req: req
    });
    require('./server/loader')(req.campsiApp);

    req.campsiApp.routes.forEach(function (route) {
        router.get(route.path, debug(route), load(route.resources), route.onEnterServer.bind(route), render(route), send(route));
    });

    next();
});

var debug = function (route) {
    return function (req, res, next) {
        console.info("========== CURRENT ROUTE =========");
        console.info(route);
        next();
    }
};

var load = function (resources) {
    return function (req, res, next) {

        var app = req.campsiApp;
        app.redirect = function (url) {
            res.redirect(url);
        };
        async.forEachSeries(resources, function (resource, cb) {
            if (req[resource]) {
                console.info('SERVER LOAD RESOURCES IN REQ', resource);
                app.getResource(resource).setData(toObject(req[resource]), cb);
            } else {
                console.info('SERVER LOAD RESOURCES NOT IN REQ', resource);
                app.getResource(resource).getData(undefined, function () {
                    console.info('LOADED', resource);
                    cb();
                });
            }
        }, next);
    };
};
var render = function (route) {
    return function (req, res, next) {
        req.campsiApp.render(route, function (panels) {
            req.panels = panels;
            next();
        });
    };
};

var send = function (route) {
    return function (req, res) {
        res.render('index', {
            version: version,
            panels: req.panels,
            user: req.user,
            config: browserConfig,
            context: req.campsiApp.serialize(),
            translations: translations[req.locale],
            route: route
        });
    }
};

module.exports = router;