/**
 * Created by cl-macmini-132 on 09/06/16.
 */

var request = require("request"),
    config = require("../config");

/***
 * To get base64 encoded bearer credentials
 * @returns {*}
 */
module.exports.getBearerTokenCredentials = function(){

    return (new Buffer(config.twitter.key+":"+config.twitter.secret)).toString("base64");
};


/**
 * To get default `request` object with base URL and headers
 * @param forOauth
 * @param accessToken
 */
module.exports.getDefaultRequestObject = function(forOauth,accessToken){


    if(forOauth){
        return request.defaults({
            baseUrl : config.twitter.baseUrl,
            headers : {
                "Authorization" : "Basic "+this.getBearerTokenCredentials()
            }
        });
    }
    else {

        return request.defaults({
            baseUrl : config.twitter.baseUrl + "/" + config.twitter.apiVersion,
            headers : {
                "Authorization" : "Bearer "+accessToken
            }
        });

    }
};

/***
 * To get access token from twitter api
 * @param cb
 */
module.exports.getTwitterAccessToken = function(cb){

    var options = {
        url : "/oauth2/token",
        method : "POST",
        headers : {
            "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8"
        },
        form :{
            "grant_type": "client_credentials"
        }
    };

    var r = this.getDefaultRequestObject(true);

    r(options,function(err,response,body){

        if(err){
            cb(new Error("Error getting access token"));
        }
        else{
            body = JSON.parse(body);

            if(body.errors!= undefined){
                var error = new Error(JSON.stringify(body.errors));
                error.code = body.errors[0].code;
                cb(error);
            }
            else{
                cb(null,body.access_token);
            }

        }
    });
};

/***
 * To get followerd IDs
 * @param accessToken
 * @param credentialType
 * @param credential
 * @param cursor
 * @param count
 * @param cb
 */

module.exports.getFollowersIds = function(accessToken,credentialType,credential,cursor,count,cb){

    var options = {
        url : "/followers/ids.json",
        method : "GET",
        qs :{}
    };

    options.qs[credentialType] = credential;
    options.qs["cursor"] = cursor;
    options.qs["count"] = count;
    options.qs["stringify_ids"] = true;

    var r = this.getDefaultRequestObject(false,accessToken);

    r(options,function(err,response,body){

        if(err){
            cb(new Error("Error getting access token"));
        }
        else{

            body = JSON.parse(body);

            if(body.errors!= undefined){
                var error = new Error(JSON.stringify(body.errors));
                error.code = body.errors[0].code;
                cb(error);
            }
            else{
                cb(null,body.ids);
            }

        }
    });
};

/***
 * To get details of string userIDs
 * @param accessToken
 * @param stringIds
 * @param cb
 */
module.exports.getUserDetails = function(accessToken,stringIds,cb){

    var options = {
        url : "/users/lookup.json",
        method : "GET",
        qs :{
            "user_id" : stringIds,
            "include_entities"  : false
        }
    };

    var r = this.getDefaultRequestObject(false,accessToken);

    r(options,function(err,response,body){

        if(err){
            cb(new Error("Error getting access token"));
        }
        else{

            body = JSON.parse(body);

            if(body.errors!= undefined){
                var error = new Error(JSON.stringify(body.errors));
                error.code = body.errors[0].code;
                cb(error);
            }
            else{
                cb(null,body);
            }
        }
    });
};

/***
 * To get profile of user
 * @param accessToken
 * @param credentialType
 * @param credential
 * @param cb
 */
module.exports.getUserProfile = function(accessToken,credentialType,credential,cb){

    var options = {
        url : "/users/show.json",
        method : "GET",
        qs :{}
    };

    options.qs[credentialType] = credential;
    options.qs["include_entities"] = false;


    var r = this.getDefaultRequestObject(false,accessToken);

    r(options,function(err,response,body){

        if(err){
            cb(new Error("Error getting access token"));
        }
        else{

            body = JSON.parse(body);

            if(body.errors!= undefined){
                var error = new Error(JSON.stringify(body.errors));
                error.code = body.errors[0].code;
                cb(error);
            }
            else{
                cb(null,body);
            }
        }
    });
};