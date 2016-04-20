var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/projects', function ($super) {
    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.filter = $('<div class="filter"><i class="fa fa-search"></i>' +
                    '<input type="search">' +
                    '</div>');
                instance.mountNode.append(instance.nodes.filter);
                Campsi.create('campsi/project-list', {
                    context: instance.context
                }, function (projectList) {
                    instance.projectList = projectList;
                    instance.mountNode.append(projectList.render());
                    next();
                });
            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.nodes.projectList, instance.context, function (projectList) {
                    instance.projectList = projectList;
                    next();
                });
            });
        },

        attachEvents: function () {

            var instance = this;

            this.projectList.attachEvents();
            this.nodes.filter.find('input').on('keyup change blur', function () {
                instance.projectList.filter($(this).val(), ['value.title', 'value.identifier']);
            });
        },

        getNodePaths: function () {
            return {
                filter: '> .filter',
                projectList: '> .campsi_project-list'
            }
        },

        valueDidChange: function (next) {
            this.projectList.setValue(this.value, next);
        },

        serializeValue: function(){

        }


    }
});