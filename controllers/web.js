

var Joi =require("joi"),
    async =require("async");


module.exports.HomeCtrl = function(req,res,next){

    res.render("home");

};


module.exports.BestTimeCtrl = function(req,res,next){

    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required()

    });



    Joi.validate(req.query,schema,{},function(err,result){

        if(err){

            var err = new Error("Incorrect parameters");
            err.status = 400;
            next(err);
        }

        else{

            res.render("best-time",{
                credentialType : req.query.credentialType,
                credential : req.query.credential
            });
        }
    });
};

module.exports.ProfileCtrl = function(req,res,next){

    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("screen_name","user_id"),
        credential : Joi.string().required()

    });





    Joi.validate(req.query,schema,{},function(err,result){

        if(err ){

            var err = new Error("Incorrect parameters");
            err.status = 400;
            next(err);
        }

        else{

            res.render("profile",{
                credentialType : req.query.credentialType,
                credential : req.query.credential
            });
        }
    });
};

