var express = require('express');
var router = express.Router();
var Invitation = require('../models/guest');



router.get('/:token', function (req, res, next) {
    Invitation.findOne({_id: req.params.token})
        .populate('invitations._project')
        .populate('invitations._inviter')
        .exec(function (err, guest) {
                  if (guest === null || typeof guest === 'undefined') {
                      return next();
                  }
                  res.render('invitation', guest.toObject());
              });

});


module.exports = router;