/* jshint node: true, strict: true */

"use strict";

var util        = require('util'),
    Readable    = require('stream').Readable,
    Connection  = require('./connection.js');
 

// General doc: https://dev.twitter.com/streaming/overview

var Twitter = module.exports = function (keys)  { 
    var self = this;
    this.connection = new Connection(keys);
    Readable.call(this, {objectMode: true});

    this.connection.on('data', function (obj) {
        if (!self.push(obj)) {
            self.connection.destroy();
        }
    });

    this.connection.on('connection success', function () {
        console.log('connection success');
    });

    this.connection.on('connection keep-alive', function () {
        console.log('connection keep-alive');
    });

    this.connection.on('connection timeout', function () {
        console.log('connection timeout');
    });

    this.connection.on('connection aborted', function () {
        console.log('connection aborted');
    });

    this.connection.on('request error', function (error) {
        console.log('connection error', error);
        self.push(null);
    });

    this.connection.on('parser error', function (error) {
        console.log('parser error', error);
    });
};
util.inherits(Twitter, Readable);



Twitter.prototype._read = function(size) {
    // Something here?
};


Twitter.prototype.stream = function (endpoint, params) {
    this.connection.stream(endpoint, params);
};


Twitter.prototype.close = function () {
    this.connection.destroy();
};
