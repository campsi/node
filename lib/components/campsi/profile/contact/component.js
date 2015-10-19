var Campsi = require('campsi');
module.exports = Campsi.extend('form', 'campsi/profile/contact', function($super){

    return {
        getDefaultOptions: function(){
            return {
                fields: [{
                    type: "text",
                    name: "email",
                    label: "email",
                    help: "the email address"
                }, {
                    type: "text",
                    name: "fullname",
                    label: "fullname"
                }, {
                    type: "file/image",
                    name: "avatar",
                    label: "avatar"
                }, {
                    type: "checkbox",
                    name: "newsletterSubscribe",
                    label: "Subscribe to the newsletter"
                }]
            }
        }
    }
});