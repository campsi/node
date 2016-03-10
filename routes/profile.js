var express = require('express');
var router = express.Router();
var Campsi = require('campsi-core');
var browserConfig = require('../browser-config');



router.get('/', function (req, res) {
    Campsi.create('campsi/profile/contact', {value: req.user}, function (contactForm) {
        Campsi.create('campsi/profile/organization', function (organizationForm) {
            res.render('profile', {
                user: req.user,
                config: browserConfig,
                contactForm: contactForm.render(),
                organizationForm: organizationForm.render()
            });
        })
    });
});


module.exports = router;