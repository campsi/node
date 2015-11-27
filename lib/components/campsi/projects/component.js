var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
var async = require('async');

module.exports = Campsi.extend('component', 'campsi/projects', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                async.series([
                    function (seriesCb) {
                        Campsi.create('campsi/help-tour-step', {
                            context: instance.context,
                            value: {
                                counter: 1,
                                message: instance.context.translate('panels.projects.help.message')
                            }
                        }, function (helpStep) {
                            instance.helpStep = helpStep;
                            instance.nodes.helpStep = helpStep.render();
                            instance.mountNode.append(instance.nodes.helpStep);
                            seriesCb();
                        });
                    }, function (seriesCb) {
                        Campsi.create('campsi/project-list', {
                            context: instance.context
                        }, function (projectList) {
                            instance.projectList = projectList;
                            instance.mountNode.append(projectList.render());
                            seriesCb();
                        });
                    }
                ], next);
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                async.parallel([
                    function (cb) {
                        Campsi.wakeUp(instance.nodes.projectList, instance.context, function (projectList) {
                            instance.projectList = projectList;
                            cb();
                        });
                    }, function (cb) {
                        Campsi.wakeUp(instance.nodes.helpStep, instance.context, function (helpStep) {
                            instance.helpStep = helpStep;
                            cb();
                        });
                    }
                ], next);
            });
        },

        attachEvents: function(){
            this.helpStep.attachEvents();
            this.projectList.attachEvents();
        },

        getNodePaths: function () {
            return {
                projectList: '> .campsi_project-list',
                helpStep: '> .campsi_help-tour-step'
            }
        },

        valueDidChange: function (next) {
            this.projectList.setValue(this.value, next);
        }
    }
});