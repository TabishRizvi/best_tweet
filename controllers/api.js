

var Joi =require("joi"),
    async =require("async"),
    _ = require("underscore"),
    moment = require("moment"),
    lib = require("../lib"),
    config = require("../config");



module.exports.FetchDataCtrl = function(req,res,next){


    var context = req.originalUrl;

    var dataObject = req.body;

    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required(),
        offset : Joi.number().integer().max(720).min(-720)

    });



    async.waterfall([
        function(cb){
            Joi.validate(dataObject,schema,{},function(err){

                if(err){
                    lib.logging.logError(context,err);
                    cb({status :400});
                }

                else{
                    cb(null);
                }
            });
        },

        function(cb){

            lib.twitter.getTwitterAccessToken(function(err,accessToken){
                if(err){
                    lib.logging.logError(context,err);
                    cb({status:500});
                }
                else{
                    dataObject.accessToken = accessToken;
                    cb(null);
                }
            });
        },

        function(cb){

            lib.twitter.getFollowersIds(dataObject.accessToken,dataObject.credentialType,dataObject.credential,-1,5000,function(err,list){
                if(err){
                    lib.logging.logError(context,err);
                    cb({status:500});
                }
                else{
                    dataObject.userIds = list;
                    dataObject.list = [];
                    cb(null);
                }
            });
        },

        function(cb){

            var count = 0;
            var limit = 100;
            async.whilst(function(){

                return count < dataObject.userIds.length;

            },function(callback){

                var stringIds = "";
                var i;

                for(i=count;i<count+limit;i++){

                    stringIds += dataObject.userIds[i];

                    if(i!=count+limit-1){
                        stringIds += ","
                    }
                }

                count += limit;

                lib.twitter.getUserDetails(dataObject.accessToken,stringIds,function(err,data){
                    if(err){
                        lib.logging.logError(context,err);
                        callback({status:500});
                    }
                    else{
                        dataObject.list = dataObject.list.concat(data);
                        callback(null);
                    }
                });

            },cb);
        },

        function(cb){

            dataObject.timeSlots ={};

            _.each(_.range(24),function(element){
                dataObject.timeSlots[element] =0;
            });

            _.each(dataObject.list,function(element){

                if(element.status!=undefined){
                    var tweetDate = moment(element.status.created_at,"ddd MMM DD HH:mm:ss Z YYYY").utcOffset(dataObject.offset);
                    dataObject.timeSlots[parseInt(tweetDate.format("H"))]++;

                }

            });

            var max = -1;
            var maxHour = -1;

            _.each(dataObject.timeSlots,function(element,key,list){

                if(element>max){
                    max = element;
                    maxHour = parseInt(key);
                }
            });



            var reponse = {
                time_slot : dataObject.timeSlots,
                max_hour : lib.utils.getMeridianTime(maxHour)
            };

            cb(null,reponse);
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

