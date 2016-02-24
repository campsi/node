var Campsi = require('campsi');
module.exports = Campsi.extend('form', 'campsi/profile/contact', function(){

    return {
        getDefaultOptions: function(){
            return {
                fields: [{
                    type: "text",
                    name: "email",
                    placeholder: "email"
                }, {
                    type: "text",
                    name: "fullname",
                    placeholder: "full name"
                }, {
                    type: "file/image",
                    name: "avatar"
                }, {
                    type: "checkbox",
                    name: "newsletterSubscribe",
                    label: "Subscribe to the newsletter",
                    checkboxText: "I want to receive news about Campsi"
                }]
            }
        }
    }
});