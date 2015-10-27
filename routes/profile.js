var express = require('express');
var router = express.Router();
var Campsi = require('campsi');

router.get('/', function (req, res, next) {
    Campsi.create('campsi/profile/contact', {value: req.user}, function (contactForm) {
        Campsi.create('campsi/profile/organization', function (organizationForm) {
            res.render('profile', {
                user: req.user,
                contactForm: contactForm.render(),
                organizationForm: organizationForm.render()
            });
        })
    });
});


module.exports = router;