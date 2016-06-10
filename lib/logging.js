/**
 * Created by Tabish Rizvi
 */

var console_logger = function(){


    return {


        level : "error",

        availableLevels : ["error","info","debug"],

        setLevel : function(level) {

            level = level.toLowerCase();
            this.level = this.availableLevels.indexOf(level) == -1 ? "error" : level;
        },

        getLevel : function(){
            return this.level;
        },

        logError : function(context,error){

            if(this.availableLevels.indexOf("error") > this.availableLevels.indexOf(this.level)){
                return;
            }

            this.logMessage("error",context,error);


        },

        logInfo : function(context,info){

            if(this.availableLevels.indexOf("info") > this.availableLevels.indexOf(this.level)){
                return;
            }

            this.logMessage("info",context,info);


        },


        logDebug : function(context,debug){

            if(this.availableLevels.indexOf("debug") > this.availableLevels.indexOf(this.level)){
                return;
            }

            this.logMessage("debug",context,debug);
        },

        logMessage : function(type,context,message){

            console.log("\n***********************************************************************");
            console.log("["+type+"]");
            console.log(context);
            console.log(message);
            console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n");

        }




    };
};

var logger = console_logger();
logger.setLevel("debug");

module.exports = logger;