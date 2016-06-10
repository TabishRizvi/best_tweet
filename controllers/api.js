

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
                else if(list.length==0){
                    lib.logging.logDebug(context,"No followers for "+dataObject.credential);
                    cb({status : 404});
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


            dataObject.weekValues = [];
            dataObject.allValues = [];
            var i,j;
            for(i=0;i<7;i++){
                var temp = [];
                for(j=0;j<24;j++){
                    temp.push(0);
                }
                dataObject.weekValues.push(temp);
            }

            for(i=0;i<24;i++){
                dataObject.allValues.push(0);
            }


            _.each(dataObject.list,function(element){

                if(element.status!=undefined){
                    var tweetDate = moment.utc(element.status.created_at,"ddd MMM DD HH:mm:ss Z YYYY").utcOffset(dataObject.offset);

                    dataObject.weekValues[parseInt(tweetDate.format("d"))][parseInt(tweetDate.format("H"))]++;

                    dataObject.allValues[parseInt(tweetDate.format("H"))]++;
                }
            });


            cb(null);
        },

        function(cb){

            dataObject.weekMaxTimes = {};
            var i, j,max1,maxTime,change1;
            var weekSum,max2,maxDay;

            max2=-1;
            maxDay=-1;


            for(i=0;i<7;i++){

                max1 = -1;
                maxTime = -1;
                weekSum =0;

                for(j=0;j<24;j++){

                    if(dataObject.weekValues[i][j]>max1){
                        max1 = dataObject.weekValues[i][j];
                        maxTime = j;
                    }

                    weekSum += dataObject.weekValues[i][j];

                    if(weekSum>max2){
                        max2 = weekSum;
                        maxDay = i;
                    }
                }
                dataObject.weekMaxTimes[lib.utils.getDayName(i)] =lib.utils.getMeridianTime(maxTime);
            }

            dataObject.maxDay = lib.utils.getDayName(maxDay);


            max1 = -1;
            maxTime = -1;
            for(i=0;i<24;i++){
                if(dataObject.allValues[i]>max1){
                    max1 = dataObject.allValues[i];
                    maxTime = i;
                }
            }

            dataObject.allMaxTime = lib.utils.getMeridianTime(maxTime);




            cb(null);

        },

        function(cb){


            var i, j;
            dataObject.weekWiseData ={};
            for(i=0;i<7;i++){
                dataObject.weekWiseData[lib.utils.getDayName(i)] ={};
                for(j=0;j<24;j++){
                    dataObject.weekWiseData[lib.utils.getDayName(i)][lib.utils.getMeridianTime(j)] = dataObject.weekValues[i][j];
                }
            }

            var response = {
                week_max_times : dataObject.weekMaxTimes,
                all_max_time :dataObject.allMaxTime,
                max_day : dataObject.maxDay,
                week_wise_data : dataObject.weekWiseData,
                test_data : dataObject.list,
                test_data1 : dataObject.allValues

            };

            cb(null,response);

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


    var context = req.originalUrl;

    var dataObject = req.body;

    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required()

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


            lib.twitter.getUserProfile(dataObject.accessToken,dataObject.credentialType,dataObject.credential,function(err,profile){
                if(err){
                    lib.logging.logError(context,err);
                    cb({status:500});
                }
                else{
                    cb(null,profile);
                }
            });

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


