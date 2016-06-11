/**
 *It contains controllers of web routes
 *
 */

var Joi =require("joi"),
    async =require("async");



/**
 * Controller for /web/home
 *
 */
module.exports.HomeCtrl = function(req,res,next){

    // Simply render the home page
    res.render("home");

};

/**
 * Controller for /web/best-tweet
 *
 */
module.exports.BestTimeCtrl = function(req,res,next){

    // Joi validation schema
    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required()

    });


    // Validate request query params against this schema
    Joi.validate(req.query,schema,{},function(err){

        if(err){
            // If err , throw error to error middleware
            var err = new Error("Incorrect parameters");
            err.status = 400;
            next(err);
        }

        else{
            // Else render page with compile options
            res.render("best-time",{
                credentialType : req.query.credentialType,
                credential : req.query.credential
            });
        }
    });
};

/**
 * Controller for /web/profile
 *
 */
module.exports.ProfileCtrl = function(req,res,next){

    // Joi validation schema
    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required()

    });

    // Validate request query params against this schema
    Joi.validate(req.query,schema,{},function(err,result){

        if(err ){
            // If err , throw error to error middleware
            var err = new Error("Incorrect parameters");
            err.status = 400;
            next(err);
        }

        else{
            // Else render page with compile options
            res.render("profile",{
                credentialType : req.query.credentialType,
                credential : req.query.credential
            });
        }
    });
};

