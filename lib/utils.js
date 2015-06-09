/* jshint node: true, strict: true */

"use strict";


module.exports.onBackoff = function (number, delay) {
    this.emit('reconnect start', number, delay);
};



module.exports.onBackoffFail = function () {
    this.emit('reconnect aborted');
};
