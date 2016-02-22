var Campsi = require('campsi');
var $ = require('cheerio-or-jquery');
module.exports = Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/profile', function ($super) {

    return {
        getDefaultOptions: function () {
            return {
                header: {
                    text: 'My profile'
                }
            }
        },

        wakeUp: function(el, context, cb){
            var instance = this;
            $super.wakeUp.call(this, el, context, function(){
                Campsi.wakeUp(instance.mountNode.find('.campsi_profile_contact'), context, function(contactForm){
                    instance.contactForm = contactForm;
                    cb();
                });
            });
        },

        attachEvents: function(){
            var instance=  this;
            this.contactForm.attachEvents();
            this.contactForm.bind('change', function(){
                 instance.mountNode.addClass('modified');
            });
            this.nodes.content.find('button').on('click', function(){
                instance.save();
            });

        },

        init: function (next) {
            var instance = this;
            $super.init.call(this, function () {
                Campsi.create('campsi/profile/contact', {context: this.context}, function (contactForm) {
                    instance.nodes.content.append(contactForm.render());
                    instance.nodes.content.append($('<button class="save">save</button>'));
                    instance.contactForm = contactForm;
                    next();
                });
            });
        },

        valueDidChange: function (next) {
            this.contactForm.setValue(this.value.user, function(){
                next();
            });
        },


        save: function(){
            var instance = this;
            $.ajax({
                method: 'PUT',
                url: '/api/v1/users/me',
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(instance.contactForm.value)
            }).done(function(){
                instance.mountNode.removeClass('modified');
            });
        }
    }
});