/* jshint node: true, strict: true */

"use strict";

var util        = require('util'),
    emits       = require('emits'),
    Readable    = require('stream').Readable,
    Backoff     = require('backoff/lib/backoff'),
    ExpStrategy = require('backoff/lib/strategy/exponential'),
    LinStrategy = require('backoff-linear-strategy'),
    Connection  = require('./connection.js'),
    utils       = require('./utils.js');
 


// General doc: https://dev.twitter.com/streaming/overview

var Twitter = module.exports = function (keys)  { 
    var self = this;

    this.connection = new Connection(keys);
    this.streamEndpoint = 'public';
    this.streamParams = {follow:'', track:''};
    
    Readable.call(this, {objectMode: true});
    this.connection.on('data', function (obj) {
        if (!self.push(obj)) {
            self.connection.destroy();
        }
    });



    // Reconnect strategy - TCP/IP level network errors
    // 250 ms linearly up to 16 seconds

    var backoffNetworkError = new Backoff(new LinStrategy({
        initialDelay: 250,
        maxDelay: 16000
    }))
    .on('backoff', utils.onBackoff.bind(this))
    .on('fail', utils.onBackoffFail.bind(this))
    .on('ready', function (number, delay) {
        self.connection.connect(self.streamEndpoint, self.streamParams, function () {
            backoffNetworkError.reset();
        });
    });



    // Reconnect strategy - HTTP errors
    // 5 seconds exponentially up to 320 seconds

    var backoffHttpError = new Backoff(new ExpStrategy({
        initialDelay: 5000,
        maxDelay: 320000
    }))
    .on('backoff', utils.onBackoff.bind(this))
    .on('fail', utils.onBackoffFail.bind(this))
    .on('ready', function (number, delay) {
        self.connection.connect(self.streamEndpoint, self.streamParams, function () {
            backoffHttpError.reset();
        });
    });



    // Reconnect strategy - HTTP 420 errors
    // 1 minute exponentially for each attempt

    var backoffRateLimited = new Backoff(new ExpStrategy({
        initialDelay: 60000,
        maxDelay: 1.8e+6
    }))
    .on('backoff', utils.onBackoff.bind(this))
    .on('fail', utils.onBackoffFail.bind(this))
    .on('ready', function (number, delay) {
        self.connection.connect(self.streamEndpoint, self.streamParams, function () {
            backoffRateLimited.reset();
        });
    });



    // Proxy underlaying events

    this.connection.on('connection success', this.emits('connection success'));
    this.connection.on('connection aborted', this.emits('connection aborted'));
    this.connection.on('connection error network', this.emits('connection error network'));
    this.connection.on('connection error http', this.emits('connection error http'));
    this.connection.on('connection rate limit', this.emits('connection rate limit'));
    this.connection.on('connection stall', this.emits('connection stall'));
    this.connection.on('data keep-alive', this.emits('data keep-alive'));
    this.connection.on('data error', this.emits('data error'));



    // Handle connection errors by reconnectiong with
    // the suitable backoff strategy

    this.connection.on('connection error network', function (msg) {
        backoffNetworkError.backoff();
    });

    this.connection.on('connection error http', function (statusCode) {
        backoffHttpError.backoff();
    });

    this.connection.on('connection rate limit', function (statusCode) {
        backoffRateLimited.backoff();
    });



    // Unknown connection error. Terminate the stream

    this.connection.on('connection error unknown', function (msg) {
        self.emit('connection error', msg);
        self.close();
        self.push(null);
    });

};
util.inherits(Twitter, Readable);



Twitter.prototype.emits = emits;



Twitter.prototype._read = function (size) {
    // Something here?
};


Twitter.prototype.stream = function (endpoint, params) {
    this.streamEndpoint = endpoint;
    this.streamParams = params;
    this.connection.connect(endpoint, params);
};



Twitter.prototype.close = function () {
    this.streamEndpoint = 'public';
    this.streamParams = {follow:'', track:''};
    this.connection.destroy();
};
