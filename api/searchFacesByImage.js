const Q      = require('q');
const lib    = require('../lib/functions.js');
const AWS    = require('aws-sdk');

module.exports = (req, res) => {

    const defered = Q.defer();

    req.body.args = lib.clearArgs(req.body.args);

    let { 
        apiKey,
        apiSecret,
        collectionId,
        faceMatchThreshold,
        maxFaces,
        image,
        region='us-east-1'
    } = req.body.args;
        
    let required = lib.parseReq({apiKey, apiSecret, collectionId, region, image});

    if(required.length > 0) 
        throw new RapidError('REQUIRED_FIELDS', required);

    try {
        if(typeof detectionAttributes == 'string') detectionAttributes = JSON.parse(detectionAttributes);
    } catch(e) {
        throw new RapidError('JSON_VALIDATION');
    }

    if(image && /^(?:[a-z]+:)/.test(image)) image = lib.download(image);

    let params = lib.clearArgs({
        CollectionId:       collectionId,
        FaceMatchThreshold: faceMatchThreshold,
        MaxFaces:           maxFaces,
        Image: {
            Bytes: image,
            /*S3Object: { 
                Bucket:  imageS3Bucket,
                Name:    imageS3Name,
                Version: imageS3Version
            }*/
         }
    }, true);

    let client = new AWS.Rekognition({
        credentials: { 
            accessKeyId:     req.body.args['apiKey'], 
            secretAccessKey: req.body.args['apiSecret']
        },
        region: region 
    });

    client.searchFacesByImage(params, (err, data) => {
        if(err) defered.reject(err); 
        else    defered.resolve(data);  
    });

    return defered.promise;
}