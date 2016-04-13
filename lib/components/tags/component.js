var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var hb = require('handlebars');
var deepCopy = require('deepcopy');
module.exports = Campsi.extend('component', 'tags', function ($super) {

    return {

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                Campsi.create('text', {context: instance.context}, function (textComponent) {
                    instance.mountNode.append($('<ul>'));
                    instance.textComponent = textComponent;
                    instance.mountNode.append(instance.textComponent.render());
                    next();
                });

            });
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('.text.component'), context, function (textComponent) {
                    instance.textComponent = textComponent;
                    next();
                });
            })
        },

        attachEvents: function () {
            var instance = this;
            instance.textComponent.attachEvents();
            instance.textComponent.bind('submit', function () {

                if(instance.value.indexOf(instance.textComponent.value) !== -1){
                    return;
                }

                var newValue = deepCopy(instance.value);
                newValue.push(instance.textComponent.value);
                instance.setValue(newValue, function(){
                    instance.textComponent.setValue('');
                });
            });

            instance.mountNode.on('click', 'ul a', function(e){
                e.preventDefault();
                var tagToRemove = $(this).closest('li').find('span').text();
                var index = instance.value.indexOf(tagToRemove);
                var newValue = deepCopy(instance.value);
                newValue.splice(index, 1);
                instance.setValue(newValue);
            });
        },

        getTagTemplate: function () {
            if (this.tagTemplate) {
                return this.tagTemplate;
            }

            this.tagTemplate = hb.compile('<li><span>{{ value }}</span><a class="remove" href="#">&times;</a></li>');
            return this.tagTemplate;
        },


        getHtml: function (data, options, callback) {
            var $ul = $('<ul class="tags">');
            if (Array.isArray(data)){
                data.forEach(function(tag){
                    $ul.append($('<li>').text(tag));
                });
            }
            callback($ul);
        },

        valueDidChange: function (next) {

            if(!Array.isArray(this.value)){
                return next();
            }

            var instance = this;
            var $ul = instance.mountNode.find('ul');
            var $lis = [];
            instance.value.forEach(function (tag) {
                $lis.push(instance.getTagTemplate()({value: tag}));
            });
            $ul.empty().append($lis);
            next();
        }
    }
});