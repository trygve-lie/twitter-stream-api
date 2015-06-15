/* jshint node: true, strict: true */

"use strict";

var pckage          = require('../package.json'),
    EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    OAuth           = require('oauth').OAuth,
    utils           = require('core-util-is'),
    Parser          = require('./parser.js'),

    endpoints = {
        public  : 'https://stream.twitter.com/1.1/statuses/filter.json',
        user    : 'https://userstream.twitter.com/1.1/user.json'
    },
    newline = '\r\n',
    abortCodes = [401, 403, 404, 406, 413, 416, 503];



var Connection = module.exports = function (params) {
    var self = this;

    this.params = params;
    this.request = undefined;


    // Set up connection

    this.oauth = new OAuth(
        "http://twitter.com/oauth/request_token",
        "http://twitter.com/oauth/access_token", 
        this.params.consumer_key, 
        this.params.consumer_secret, 
        "1.0A", 
        null, 
        "HMAC-SHA1",
        null,
        {   
            "Accept" : "*/*",
            "Connection" : "close",
            "User-Agent" : "node.js - " + pckage.name + ' - ' + pckage.version
        }
    );


    // Set up parser

    this.parser = new Parser();

    this.parser.on('message', function (message) {
        if (utils.isObject(message)) {
            self.emit('data', message);
        }
    });

    this.parser.on('error', function (error) {
        self.emit('data error', error);
    });
};
util.inherits(Connection, EventEmitter);



Connection.prototype.connect = function (endpoint, params, callback) {
    
    var self = this;

    if (!utils.isObject(params)) {
        params = {};
    }


    // Do request against Twitter

    self.request = self.oauth.post(
        endpoints[endpoint],
        self.params.access_token_key,
        self.params.access_token_secret,
        params, 
        null
    );


    // Connection has stalled if data has not received after 90 seconds

    self.request.setTimeout(90000, function () {
        self.emit('connection error stall');
        self.destroy();
    });


    self.request.once('response', function (response) {

        // Connection is being rate limited by Twitter

        if (response.statusCode === 420) {
            return self.emit('connection rate limit', response.statusCode);
        }

        // Connection adhere to one of Twitters defined error status codes

        if (abortCodes.indexOf(response.statusCode) !== -1) {
            return self.emit('connection error http', response.statusCode);
        }

        // Connection have an unknown error

        if (response.statusCode !== 200) {
            return self.emit('connection error unknown', response.statusCode);
        }


        self.emit('connection success');
        if (callback) {
            callback.call();
        }
        
        response.on('data', function (chunk) {
            if (chunk == newline) {
                return self.emit('data keep-alive');
            }
            self.parser.parse(chunk);
        });


        // Connection failed due to a network error

        response.on('error', function (error) {
            self.emit('connection error unknown', error);
        });


        // Connection was closed 

        response.on('close', function () {
            self.request.abort();
        });

    });

    self.request.on('error', function (error) {
        self.emit('connection error network', error);
    });
    
    self.request.end();
};



Connection.prototype.destroy = function () {
    this.emit('connection aborted');
    this.request.abort();
};
