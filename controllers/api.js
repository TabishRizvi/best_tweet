

var Joi =require("joi"),
    async =require("async"),
    lib = require("../lib"),
    config = require("../config");



module.exports.FetchDataCtrl = function(req,res,next){


    var payload = req.body;

    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("userName","userId"),
        credential : Joi.string().required()

    });


    async.waterfall([
        function(cb){
            Joi.validate(payload,schema,{},function(err,result){

                if(err){

                    cb({status :400});
                }

                else{

                    cb(null);
                }
            });
        },

        function(cb){

            cb(null,{});
        }
    ],function(err,result){

        if(err){
            res.status(err.status).send({
                message :lib.utils.getErrorMessage(err.status),
                status : err.status,
                data : result
            });
        }
        else{
            res.status(200).send({
                message : "OK",
                status : 200,
                data : result
            })
        }
    });




};


module.exports.FetchProfileCtrl = function(req,res,next){

    var payload = req.body;
    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("userName","userId"),
        credential : Joi.string().required()

    });


    async.waterfall([
        function(cb){
            Joi.validate(payload,schema,{},function(err,result){

                if(err){

                    cb({status :400});
                }

                else{

                    cb(null);
                }
            });
        },

        function(cb){

            var bearerTokenCredentials = lib.utils.getBearerTokenCredentials();

            var options = {
                method: 'POST',
                url: 'https://api.twitter.com/oauth2/token',
                qs: {
                    origins: origins.join("|"),
                    destinations: destinations.join("|"),
                    mode: "driving",
                    units: "metric",
                    language: "en",
                    avoid: "",
                    client: client,
                    signature: signature
                }
            };


            cb(null,{});
        }
    ],function(err,result){

        if(err){
            res.status(err.status).send({
                message :lib.utils.getErrorMessage(err.status),
                status : 200,
                data : result
            });
        }
        else{
            res.status(200).send({
                message : "OK",
                status : 200,
                data : result
            })
        }
    });
};

