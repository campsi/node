'use strict';
var Campsi = require('campsi-core');
module.exports = Campsi.extend('component', 'campsi/collection-list/collection', function ($super) {
    return {
        getTemplate: function () {
            return '<div>' + '   <div class="name"><a href="{{editEntriesHref}}">{{name}}</a></div>' + '   <div class="entries"><span class="count">{{entriesCount}}</span>&nbsp;{{entriesText}}</div>' + '   <div class="actions">' + '       <a href="{{editStructureHref}}">' + '           <img src="https://campsi.imgix.net/56b0f1c85f9e20f80551b670-N1Iq0H41W.png">' + '           <span>{{editStructureText}}</span>' + '       </a>' + '   </div>' + '</div>';
        },
        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('handlebars', {
                    options: { template: instance.getTemplate() },
                    context: instance.context
                }, function (hbComp) {
                    instance.templateComponent = hbComp;
                    instance.mountNode.append(hbComp.render());
                    next();
                });
            });
        },
        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(this, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('> .component'), context, function (hbComp) {
                    instance.templateComponent = hbComp;
                    next();
                });
            });
        },
        valueDidChange: function (next) {
            var templateVars = {
                name: this.value.name,
                entriesCount: this.value.entries.length,
                entriesText: this.context.translate('panels.project.collectionList.entriesCount'),
                editStructureHref: this.context.applicationURL('collection', { collection: this.value }),
                editStructureText: this.context.translate('panels.project.collectionList.editBtn'),
                editEntriesHref: this.context.applicationURL('entriesAndDrafts', { collection: this.value }),
                editEntriesText: this.context.translate('panels.project.collectionList.adminBtn')
            };
            this.templateComponent.setValue(templateVars, next);
        }
    };
});