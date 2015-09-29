/* jshint node: true, strict: true */

"use strict";

var util = require('core-util-is');


module.exports.onBackoff = function (number, delay) {
    this.emit('reconnect start', number, delay);
};



module.exports.onBackoffFail = function () {
    this.emit('reconnect aborted');
};



module.exports.parseParams = function (params) {
    var parsedParams = {};

    if (!util.isObject(params)) {
        return null;
    }

    Object.keys(params).forEach(function (key) {
        if (util.isNullOrUndefined(params[key])) {
            return;
        }

        if (key === 'follow' || key === 'track' || key === 'locations') {
            if (util.isArray(params[key])) {
                if (params[key].length !== 0) {
                    parsedParams[key] = params[key].join(',');
                }
            }

            if (util.isString(params[key])) {
                if (params[key] !== '') {
                    parsedParams[key] = params[key];
                }
            }

            return;
        }

        parsedParams[key] = params[key];
    });

    return (Object.keys(parsedParams).length !== 0) ? parsedParams : null;
};
