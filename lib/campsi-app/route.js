var isBrowser = require('is-browser');

var Route = function (options) {
    this.name = options.name;
    this.path = options.path;
    this.layout = options.layout;
    this.resources = options.resources || [];
};

Route.prototype.getUrl = function (context, params, forceId) {

    var resource;
    var typeofParam;

    return this.path.replace(/:\w+/g, function (param) {
        param = param.substring(1);

        if (typeof params !== 'undefined') {
            typeofParam = typeof params[param];
        }

        if (typeofParam === 'string') {
            return params[param];
        }

        if (typeofParam === 'object') {
            resource = params[param.substring()];
            return (forceId || typeof resource.identifier === 'undefined') ? resource._id : resource.identifier;
        }

        return context.getResource(param).getIdentifier(forceId);
    });

};

Route.prototype.onEnterServer = function (req, res, next) {
    this.onEnter(req.campsiApp, next);
};
Route.prototype.onEnterBrowser = function (ctx, next) {
    this.onEnter(ctx.campsiApp, next);
};

Route.prototype.onEnter = function(app, next){
    next();
};

module.exports = Route;