/**
 *Import npm modules
 *
 */
var express = require('express'),
    morgan = require('morgan'),
    path = require('path'),
    os = require('os'),
    bodyParser = require('body-parser'),
    exphbs  = require('express-handlebars');


/**
 *Import route definition files
 *
 */
var routes = require('./routes');

/**
 *Initialise an express app
 *
 */
var app = express();

/**
 *To set default views directory and view engine( in this case, handlebars)
 *
 */
app.use(express.static('public'));
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));



/**
 *To set default headers
 *
 */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");

    next();
});


/**
 *Initialise default http logger,request body parser(in this case json body) and public directory folder to serve static files
 *
 */
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));





/**
 *To mount routers to specfic paths
 *
 */
app.use('/web', routes.web);
app.use('/api', routes.api);

/**
 *to make /web/home the starting point
 *
 */
app.get("/",function(req,res){
    res.redirect("/web/home");
});

/**
 *To avoid favicon.ico not found errors
 *
 */
app.get("/favicon.ico",function(req,res){

    res.set('Content-Type', 'image/x-icon');

    res.status(200).end();

});


/**
 *To handle paths to which no route has been defined
 *
 */
app.use(function (req, res, next) {
    var err = new Error(req.originalUrl +' not Found');
    err.status = 404;
    next(err);
});


/**
 *Error middleware to render sometging went wrong page in case error is thrown
 *
 */
app.use(function (err, req, res, next) {
    console.log("err",err);
    res.render("wrong");
});


module.exports = app;
