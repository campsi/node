var router = require('express').Router();
var config = require('../../../config');
var shortid = require('shortid');
var formidable = require('formidable');
var async = require('async');
var AWS = require('aws-sdk');
var isImage = require('is-image');
var fs = require('fs');
var getImageSize = require('image-size');

AWS.config.update({
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
});


var uploadFileToS3 = function (file, progress, complete) {
    var body = fs.createReadStream(file.path);
    var s3obj = new AWS.S3({params: {Bucket: 'campsi-eu', Key: file.key}});
    s3obj
        .upload({Body: body})
        .on('httpUploadProgress', function () {
            file.loaded = progress.loaded;
            progress();
        })
        .send(function (err, data) {

            // todo handle err
            file.uri = data.Location;
            file.src = isImage(file.key) ? config.imgix.host + '/' + file.key : data.Location;
            complete();
        });
};

var uploadFilesToS3 = function (files, progress, complete) {
    async.forEach(files, function (file, next) {
        uploadFileToS3(file, progress, next);
    }, complete)
};

router.post('/upload', function (req, res) {

    var form = new formidable.IncomingForm();
    var files = [];

    form.multiples = true;
    form.encoding = 'utf-8';

    // todo maybe à set dans la conf
    //form.uploadDir = TEST_TMP;

    form.on('file', function (field, file) {

        if (isImage(file.name)) {
            try {
                var size = getImageSize(file.path);
                file.height = size.height;
                file.width = size.width;
            } catch (err) {

            }
        }

        var ext = file.name.substring(file.name.lastIndexOf('.'));
        var id = shortid.generate();
        file.key = req.user._id.toString() + '-' + id + ext;
        files.push(file);
    }).on('end', function () {
        uploadFilesToS3(files, function () {

        }, function () {
            res.json(files.map(function (file) {
                return {
                    mime: file.type,
                    size: file.size,
                    key: file.key,
                    uri: file.uri,
                    src: file.src,
                    name: file.name,
                    height: file.height,
                    width: file.width
                }
            }));
        });
    });

    form.parse(req);
});
/*
 router.post('/upload-multipart', function (req, res) {

 });
 */
module.exports = router;