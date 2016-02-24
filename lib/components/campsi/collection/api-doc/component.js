var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');

module.exports = Campsi.extend('component', 'campsi/collection/api-doc', function ($super) {

    return {
        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.mountNode.append($('<h3>').text('How to call the API'));
                instance.mountNode.append($('<img>').attr('src', 'http://kinlane-productions.s3.amazonaws.com/api-evangelist-site/tool/bw-swagger-round.png'));
                instance.mountNode.append($('<article>').html('<p>In lacinia leo at augue suscipit bibendum. Morbi diam nisi, accumsan in rutrum quis, bibendum ac velit.</p>' +
                    '<p> Vestibulum at nibh ullamcorper, varius diam eu, placerat neque. Nunc et erat lacus.</p> Fusce iaculis neque nibh, et mattis felis interdum at. Sed id felis libero. Curabitur non ornare justo.</p>'));
                Campsi.create('text', {context: instance.context, options: {disabled: true}}, function (textComponent) {
                    instance.textComponent = textComponent;
                    instance.mountNode.append(instance.textComponent.render())
                });
                next();
            })
        },

        wakeUp: function (el, context, next) {
            var instance = this;
            $super.wakeUp.call(instance, el, context, function () {
                Campsi.wakeUp(instance.mountNode.find('.component.text'), context, function (textComponent) {
                    instance.textComponent = textComponent;
                    next();
                });
            });
        },

        valueDidChange: function (next) {
            this.textComponent.setValue(this.value, next);
        }


    }
});