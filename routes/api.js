/**
 *It declares api routes and their specific controllers
 *
 */
var express = require('express'),
    controllers = require("../controllers");


var router = express.Router();


router.post('/fetch-data',controllers.api.FetchDataCtrl);

router.post('/fetch-profile',controllers.api.FetchProfileCtrl);

module.exports = router;