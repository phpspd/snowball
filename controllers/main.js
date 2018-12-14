'use strict';

let ctrlName = 'main'
    , views = require('../utils/views')(ctrlName)
    //, proxy = require('../utils/proxy')
    , config = require('../config')
    ;

const STATUSES = require('../utils/statuses');

/**
 * Method: ALL
 * URI: *
 * */
exports.common = function (req, res, next) {
    res.viewData = {};
    
    res.viewData.errors = [];

    next();
}

/**
 * Method: ALL
 * URI: *
 * */
exports.commonEnd = function (req, res, next) {
    if (!res.viewData || !res.viewData.layout) {
        return next();
    }
    return res.render(res.viewData.layout, res.viewData, res.viewData.partials || null);
}