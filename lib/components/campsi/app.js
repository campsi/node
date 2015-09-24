var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');
var page = require('page');


window.panelComponents = {};

var componentsDidLoad = function(){
    configureRoutes(page);
};

var configureRoutes = function(router){

    router('/', function(){
        hola('welcome+projects');
    });

    router('/projects', function(){
        hola('projects:20+project:80');
    });

    router('/projects/:id', function(ctx){
        panelComponents.project.component.load(ctx.params.id, function(){
            hola('projects:20+project:80');
        });
    });

    router('/collections/:id', function(ctx){
        panelComponents.collection.component.load(ctx.params.id, function(){
            hola('collection');
        });
    });

    router('/collections/:id/admin', function(ctx){
        panelComponents.entries.component.load(ctx.params.id, function(){
            hola('entries:30+entry:70');
        });
    });

    router('/collections/:id/design', function(ctx){
        panelComponents['collection-designer'].component.load(ctx.params.id, function(){
            hola('collection-designer:70+components:30');
        });
    });

    router();
};

$(function(){

    async.forEach($('.panel'), function(el, cb){
        Campsi.wakeUp(el, function(comp){
            comp.attachEvents();
            window.panelComponents[comp.id] = comp;
            cb();
        });
    },componentsDidLoad);
});

