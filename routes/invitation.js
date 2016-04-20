'use strict';
var express = require('express');
var router = express.Router();
var Guest = require('../models/guest');
var browserConfig = require('../browser-config');
router.get('/:token', function (req, res, next) {
    Guest.findOne({ _id: req.params.token }).populate('invitations._project').populate('invitations._inviter').exec(function (err, guest) {
        if (guest === null || typeof guest === 'undefined') {
            return next();
        }
        res.render('invitation', {
            config: browserConfig,
            guest: guest.toObject(),
            user: req.user
        });
    });
});
module.exports = router;