var router = require('express').Router();
var getRawBody = require('raw-body');
var config = require('../../../config');
var AWS = require('aws-sdk');
var shortid = require('shortid');
var isImage = require('is-image');

AWS.config.update(config.s3);


router.post('/upload', function (req, res) {
    getRawBody(req).then(function (buf) {

        var filename = req.headers['x-file-name'];
        var ext = filename.substring(filename.lastIndexOf('.'));
        var id = shortid.generate();
        var key = req.user._id.toString() + '-' + id + ext;
        var s3obj = new AWS.S3({params: {Bucket: 'campsi-eu', Key:  key}});
        s3obj.upload({Body: buf})
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
});

router.post('/upload-multipart', function (req, res) {

});

module.exports = router;