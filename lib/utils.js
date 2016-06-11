/**
 *
 * It contains custom utility functions
 */

var config = require("../config");

/***
 * To get error message from error status
 * @param status
 * @returns {*}
 */
module.exports.getErrorMessage = function(status){

    var messages = {
        400 : "Bad request.",
        401 : "Unauthorized.",
        404 : "Not found",
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


/***
 * To get 12 hour fotmat time
 * @param hour
 * @returns {string}
 */
module.exports.getMeridianTime = function(hour){

    var meridian = hour < 12 ? "AM" : "PM";
    var hour12 = hour%12 || hour;

    return hour12+" "+meridian;
};

/**
 * to get day names from day number
 * @param day
 * @returns {*}
 */
module.exports.getDayName = function(day){

    var dayNames = {
        0 : "Sunday",
        1 : "Monday",
        2 : "Tuesday",
        3 : "Wednesday",
        4 : "Thursday",
        5 : "Friday",
        6 : "Saturday"
    };

    if(dayNames[day]==undefined){
        var err = new Error("Invalid day in getDayName");
        err.status = 500;
        throw err;
    }
    else{
        return dayNames[day];
    }
};