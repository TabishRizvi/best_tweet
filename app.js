var express = require('express'),
    morgan = require('morgan'),
    path = require('path'),
    os = require('os'),
    bodyParser = require('body-parser'),
    exphbs  = require('express-handlebars');



var routes = require('./routes');


var app = express();

app.use(express.static('public'));
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));




app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");

    next();
});



app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));






app.use('/web', routes.web);
app.use('/api', routes.api);

app.get("/",function(req,res){
    res.redirect("/web/home");
});

app.get("/favicon.ico",function(req,res){

    res.set('Content-Type', 'image/x-icon');

    res.status(200).end();

});



app.use(function (req, res, next) {
    var err = new Error(req.originalUrl +' not Found');
    err.status = 404;
    next(err);
});



app.use(function (err, req, res, next) {
    console.log("err",err);
    res.render("wrong");
});


module.exports = app;
