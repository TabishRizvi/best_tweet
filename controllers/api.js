/**
 *It contains controllers of api routes
 *
 */

var Joi =require("joi"),
    async =require("async"),
    _ = require("underscore"),
    moment = require("moment"),
    lib = require("../lib"),
    config = require("../config");


/**
 * Controller for /api/fetch-data
 *
 */
module.exports.FetchDataCtrl = function(req,res,next){

    // Context for logging purposes
    var context = req.originalUrl;

    // dataObject to which all the important data received is attached as key-value pair
    var dataObject = req.body;

    // Joi validation schema
    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required(),
        offset : Joi.number().integer().max(720).min(-720)

    });


    // To manage execution of many asynchronous function , async.waterfall is used. async.series cab be used as well

    async.waterfall([

        function(cb){
            // Validate request body  against this schema
            Joi.validate(dataObject,schema,{},function(err){

                if(err){
                    // If error , send 400 Bad request response
                    lib.logging.logError(context,err);
                    cb({status :400});
                }

                else{
                    cb(null);
                }
            });
        },

        function(cb){
            // To get application-only access token
            lib.twitter.getTwitterAccessToken(function(err,accessToken){
                if(err){
                    // If error, send 500 error response
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

            //To get followers ids of the given user. In this case, max 5000
            lib.twitter.getFollowersIds(dataObject.accessToken,dataObject.credentialType,dataObject.credential,-1,5000,function(err,list){
                if(err){
                    lib.logging.logError(context,err);
                    // To handle the case when user is not found
                    if(err.code==34){
                        cb({status:404});
                    }
                    else{
                        cb({status:500});
                    }
                }
                else if(list.length==0){
                    // To handle the case when the given user has no followers
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


            // To split userIDs into chunks of 100 string ids
            var stringIds = [];
            var limit = 100;
            var i;
            for(i=0;i<dataObject.userIds.length;i+=limit){
                var tempArray = dataObject.userIds.slice(i,i+limit);
                stringIds.push(tempArray.join(","));
            }

            // Get user data for each chunk in parallel
            async.each(stringIds,function(element,callback){

                lib.twitter.getUserDetails(dataObject.accessToken,element,function(err,data){
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


            // To collect last tweet by followers week wise in 24 hours slots and as well as overall 24 hours time slot

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

            // weekValues - 2D array of 7 by 24
            // allValues - !D array of 24

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
            var i, j,max1,maxTime;
            var weekSum,max2,maxDay;

            max2=-1;
            maxDay=-1;

            // To calculate week wise best time and also best day

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

            // To calculate overall best time
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


            // To sanitize week wise data for ouptur

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
                week_wise_data : dataObject.weekWiseData

            };

            cb(null,response);

        }
    ],function(err,result){


        // Finally send response back
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


/**
 * Controller for /api/fetch-data
 *
 */
module.exports.FetchProfileCtrl = function(req,res,next){

    // Context for logging purposes
    var context = req.originalUrl;

    // dataObject to which all the important data received is attached as key-value pair
    var dataObject = req.body;

    //Joi validation schema
    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required()

    });



    async.waterfall([

        function(cb){
            // Validate request body  against this schema
            Joi.validate(dataObject,schema,{},function(err){

                if(err){
                    // If err ,send 400 Bad request
                    lib.logging.logError(context,err);
                    cb({status :400});
                }

                else{
                    cb(null);
                }
            });
        },

        function(cb){
            // To get application-only access token
            lib.twitter.getTwitterAccessToken(function(err,accessToken){
                if(err){
                    // If error, send 500 error response
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

            // To get user profile of given user
            lib.twitter.getUserProfile(dataObject.accessToken,dataObject.credentialType,dataObject.credential,function(err,profile){
                if(err){
                    lib.logging.logError(context,err);
                    if(err.code==50){
                        cb({status:404});
                    }
                    else{
                        cb({status:500});
                    }
                }
                else{
                    var response = _.pick(profile,["name","screen_name","profile_image_url","profile_image_url_https","statuses_count","friends_count","followers_count","favourites_count"]);
                    cb(null,response);
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


