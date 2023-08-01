const AWS = require("aws-sdk");
const fs = require("fs");
const nanoid = require("nanoid");
const path = require('path');
const mime = require('mime');

AWS.config.update({region: 'ap-southeast-1'});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = (filePath, ext, next) => {
    fs.readFile(filePath, (err, data) => {
        if (err) return next(err);
        let fileName = nanoid.nanoid() + (ext || path.extname(filePath));
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: "images/" + fileName,
            Body: data,
            ACL: "public-read",
            ContentType: mime.getType(fileName),
        };
        s3.upload(params, function (s3Err, data) {
            if (s3Err) return next(s3Err);
            next(null, data.Key);
        });
    });
};

const getFile = function (req, res, next) {
    try {
        res.removeHeader('Access-Control-Allow-Credentials');
        let key = req.params.file;
        let params = {Bucket: process.env.AWS_S3_BUCKET, Key: key};
        let obj = s3.getObject(params)
        obj.on('httpHeaders', function (statusCode, headers) {
            res.set('Content-Length', headers['content-length']);
            res.set('Content-Type', mime.getType(key) || headers['content-type']);
            res.set('Access-Control-Allow-Credentials', 'omit');
        })
        obj.createReadStream().on('error', next).pipe(res)
    } catch (e) {
        next(e);
    }
}

module.exports = {uploadFile, getFile};