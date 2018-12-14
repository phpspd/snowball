'use strict';

let ctrlName = 'game'
    , views = require('../utils/views')(ctrlName)
    //, proxy = require('../utils/proxy')
    , config = require('../config')
    ;

const STATUSES = require('../utils/statuses');

module.exports.index = async function(req, res, next) {
    try {
        let view = 'index'
            , viewData = {}
            , layout = 'layout'
            ;
        res.viewData.content = views.render(view, viewData);

        res.viewData.layout = layout;
        return next();
    } catch (err) {
        console.log(err);
    }
}