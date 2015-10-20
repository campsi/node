var router = require('express').Router();
var getRawBody = require('raw-body');
var config = require('../../../config');
var AWS = require('aws-sdk');

AWS.config.update(config.s3);



router.post('/upload', function (req, res) {
    console.info("upload");
    getRawBody(req).then(function (buf) {
        console.info("ready");

        var s3obj = new AWS.S3({params: {Bucket: 'campsi-eu', Key: 'myKey'}});
        s3obj.upload({Body: buf}).
            on('httpUploadProgress', function(evt) { console.log(evt); }).
            send(function(err, data) { console.log(err, data) });

        res.json({});
    });
});

module.exports = router;