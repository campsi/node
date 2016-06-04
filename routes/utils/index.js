'use strict';

var express = require('express');
var router = express.Router();

router.use('/facebook', require('./facebook'));
router.use('/stripe', require('./stripe'));
router.use('/export', require('./export'));
router.use('/import', require('./import'));
router.use('/ajax-proxy', require('./ajax-proxy'));
module.exports = router;