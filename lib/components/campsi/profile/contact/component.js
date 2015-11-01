var Campsi = require('campsi');
module.exports = Campsi.extend('form', 'campsi/profile/contact', function($super){

    return {
        getDefaultOptions: function(){
            return {
                fields: [{
                    type: "text",
                    name: "email",
                    label: "email",
                    help: "Please enter the email address that will be used for notifications and invitations."
                }, {
                    type: "text",
                    name: "fullname",
                    label: "full name",
                    help: "How other users will see you"
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