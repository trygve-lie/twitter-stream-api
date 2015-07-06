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
    if (!util.isNullOrUndefined(params.follow)) {
        if (util.isArray(params.follow)) {
            params.follow = params.follow.join(',');
        }
    }

    if (!util.isNullOrUndefined(params.track)) {
        if (util.isArray(params.track)) {
            params.track = params.track.join(',');
        }
    }

    if (!util.isNullOrUndefined(params.locations)) {
        if (util.isArray(params.locations)) {
            params.locations = params.locations.join(',');
        }
    }

    return params;
};
