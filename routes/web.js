var express = require('express'),
    controllers = require("../controllers");


var router = express.Router();




router.get('/home',controllers.web.HomeCtrl);

router.get('/best-time',controllers.web.BestTimeCtrl);

router.get('/profile',controllers.web.ProfileCtrl);







module.exports = router;