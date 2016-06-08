

var Joi =require("joi"),
    async =require("async");


module.exports.HomeCtrl = function(req,res,next){

    res.render("home");

};


module.exports.BestTimeCtrl = function(req,res,next){

    var schema = Joi.object().keys({
        userName: Joi.string().required().allow(""),
        userId : Joi.string().required().allow("")

    });



    Joi.validate(req.query,schema,{},function(err,result){

        if(err || ! (req.query.userName=="" ^ req.query.userId=="") ){

            var err = new Error("Incorrect parameters");
            err.status = 400;
            next(err);
        }

        else{

            res.render("best-time",{
                credentialType : req.query.userId==""?"userName":"userId",
                credential : req.query.userId==""?req.query.userName:req.query.userId
            });
        }
    });
};

module.exports.ProfileCtrl = function(req,res,next){

    var schema = Joi.object().keys({
        credentialType: Joi.string().required().valid("userName","userId"),
        credential : Joi.string().required()

    });




    Joi.validate(req.query,schema,{},function(err,result){

        if(err ){

            var err = new Error("Incorrect parameters");
            err.status = 400;
            next(err);
        }

        else{

            res.render("home");
        }
    });
};

