var express = require('express');
var router = express.Router();

let mainCtrl = require('../controllers/main')
    , authCtrl = require('../controllers/auth')
    , gameCtrl = require('../controllers/game')
    , socketCtrl = require('../controllers/socket')
    ;

    
router.all('*', mainCtrl.common);

router.get('/', function(req, res, next) {
    return res.redirect(302, '/auth/');
});

router.get('/auth/', authCtrl.index);
router.post('/auth/', authCtrl.index);

router.get('/game', gameCtrl.index);
router.get('/socket', socketCtrl.index);

router.all('*', mainCtrl.commonEnd);

//router.all('*', errorsCtrl['404']);

module.exports = router;
