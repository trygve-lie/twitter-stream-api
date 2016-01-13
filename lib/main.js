/* jshint node: true, strict: true */

/** 
  * @module twitter-stream-api
  */

"use strict";

var util        = require('util'),
    emits       = require('emits'),
    utils       = require('core-util-is'),
    Readable    = require('readable-stream').Readable,
    Backoff     = require('backoff/lib/backoff'),
    ExpStrategy = require('backoff/lib/strategy/exponential'),
    LinStrategy = require('backoff-linear-strategy'),
    Connection  = require('./connection.js'),
    helpers     = require('./helpers.js');
 


/** 
  * Create a new Twitter Stream API client Object
  * @class
  *
  * @param {Object} keys Object containing Twitter API Keys and access tokens
  * @param {String} keys.consumer_key Twitter consumer key (API Key)
  * @param {String} keys.consumer_secret Twitter consumer secret (API Secret)
  * @param {String} keys.token Twitter access token
  * @param {String} keys.token_secret Twitter access token secret
  * @param {(Boolean[]|Object[])} param1 If the stream should run in object mode or not. Default true.
  * @param {Object[]} param2 A configurations Object
  */

var Twitter = module.exports = function (keys, param1, param2)  { 
    var self = this;
    var objectMode = true;
    var options = {};

    if (utils.isBoolean(param1)) {
        objectMode = param1;
    }

    if (utils.isObject(param1)) {
        options = param1;
    }

    if (utils.isObject(param2)) {
        options = param2;
    }

    this.connection = new Connection(keys, options);
    this.streamEndpoint = 'statuses/filter';
    this.streamParams = null;
    
    Readable.call(this, {objectMode: objectMode});
    this.connection.on('data', function (obj) {
        if (!self.push(objectMode ? obj : JSON.stringify(obj))) {
            self.connection.destroy();
        }
    });



    // Reconnect strategy - TCP/IP level network errors
    // 250 ms linearly up to 16 seconds

    var backoffNetworkError = new Backoff(new LinStrategy({
        initialDelay: 250,
        maxDelay: 16000
    }))
    .on('backoff', helpers.onBackoff.bind(this))
    .on('fail', helpers.onBackoffFail.bind(this))
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
    .on('backoff', helpers.onBackoff.bind(this))
    .on('fail', helpers.onBackoffFail.bind(this))
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
    .on('backoff', helpers.onBackoff.bind(this))
    .on('fail', helpers.onBackoffFail.bind(this))
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
    this.connection.on('connection error stall', this.emits('connection error stall'));
    this.connection.on('connection rate limit', this.emits('connection rate limit'));
    this.connection.on('data keep-alive', this.emits('data keep-alive'));
    this.connection.on('data error', this.emits('data error'));



    // Handle connection errors by reconnectiong with
    // the suitable backoff strategy

    this.connection.on('connection error network', function (error) {
        if (backoffNetworkError.timeoutID_ === -1) {
            backoffNetworkError.backoff();
        }
    });

    this.connection.on('connection error stall', function (msg) {
        if (backoffNetworkError.timeoutID_ === -1) {
            backoffNetworkError.backoff();
        }
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



/** 
  * Open a stream on a given endpoint
  *
  * @param {String} endpoint The endpoint to connect to
  * @param {Object} parameters Object containing parameters to the endpoint
  */

Twitter.prototype.stream = function (endpoint, parameters) {
    this.streamEndpoint = endpoint;
    this.streamParams = helpers.parseParams(parameters);
    this.connection.connect(this.streamEndpoint, this.streamParams);
};



/** 
  * Close a open stream
  */

Twitter.prototype.close = function () {
    this.streamEndpoint = 'statuses/filter';
    this.streamParams = null;
    this.connection.destroy();
};



/** 
  * Debug method for attaching a debugger to the underlaying connection
  *
  * @param {function} callback Callback where the first argument is the underlaying connection to Twitter
  */

Twitter.prototype.debug = function (callback) {
    callback.call(null, this.connection.debug());
};
