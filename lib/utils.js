/**
 * Created by cl-macmini-132 on 08/06/16.
 */

var config = require("../config");

module.exports.getErrorMessage = function(status){

    var messages = {
        400 : "Bad request.",
        401 : "Unauthorized.",
        500 : "Internal server error."
    };

    if(messages[status]==undefined){
        var err = new Error("Invalid status in getErrorMessage");
        err.status = 500;
        throw err;
    }
    else{
        return messages[status];
    }
};


module.exports.getMeridianTime = function(hour){

    var meridian = hour < 12 ? "AM" : "PM";
    var hour12 = hour%12 || hour;

    return hour12+" "+meridian;
};