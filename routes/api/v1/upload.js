var router = require('express').Router();
var config = require('../../../config');
var shortid = require('shortid');
var multiparty = require('multiparty');
var AWS = require('aws-sdk');
var isImage = require('is-image');
//AWS.config.update(config.s3);

AWS.config.update({
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
});

router.post('/upload', function (req, res) {

    console.info("upload start");
    var form = new multiparty.Form();

    form.on('part', function (part) {
        var ext = part.filename.substring(part.filename.lastIndexOf('.'));
        var id = shortid.generate();
        var key = req.user._id.toString() + '-' + id + ext;

        var s3obj = new AWS.S3({params: {Bucket: 'campsi-eu', Key: key}});

        s3obj.upload({Body: part})
            .on('httpUploadProgress', function (evt) {
                // todo : try to find a way to inform the client
            })
            .send(function (err, data) {
                console.error(err);
                res.json({
                    uri: isImage(id + ext) ? config.imgix.host + '/' + key : data.Location
                });
            });
    });

    form.parse(req);
});
/*
 router.post('/upload-multipart', function (req, res) {

 });
 */
module.exports = router;