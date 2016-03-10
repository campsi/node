var router = require('express').Router();
var config = require('../../../config');
var shortid = require('shortid');
var multiparty = require('multiparty');
var AWS = require('aws-sdk');
var isImage = require('is-image');
//AWS.config.update(config.s3);


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
                console.log(evt);
            })
            .send(function (err, data) {
                console.log(err);
                console.dir(data);
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