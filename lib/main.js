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
            // self.connection.STOP();
        }
    });

    this.connection.on('connected', function () {
        console.log('connected');
    });

    this.connection.on('request close', function (ev) {
        console.log('request close', ev);
    });

    this.connection.on('request error', function (error) {
        console.log('request error', error);
        self.push(null);
    });

    this.connection.on('parser error', function (error) {
        console.log('parser error', error);
    });

    this.connection.on('close', function (ev) {
        console.log('close', ev);
        self.push(null);
    });

    this.connection.on('error', function (error) {
        console.log('error');
        self.push(null);
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
