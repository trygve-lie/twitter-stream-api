/* jshint node: true, strict: true */

"use strict";

var EventEmitter    = require('events').EventEmitter,
    OAuth           = require('oauth').OAuth,
    Recovery        = require('recovery'),
    util            = require('core-util-is'),
    Parser          = require('./parser.js'),

    endpoints = {
        public  : 'https://stream.twitter.com/1.1/statuses/filter.json',
        user    : 'https://userstream.twitter.com/1.1/user.json'
    },
    newline = '\r\n',
    abortCodes = [400, 401, 403, 404, 406, 410, 422];



var Connection = module.exports = function (params) {
    var self = this;

    this.params = params;
    this.request = undefined;
    
    this.oauth = new OAuth(
        "http://twitter.com/oauth/request_token",
        "http://twitter.com/oauth/access_token", 
        this.params.consumer_key, 
        this.params.consumer_secret, 
        "1.0A", 
        null, 
        "HMAC-SHA1"
    );

    this.parser = new Parser();

    this.parser.on('message', function (message) {
        if (util.isObject(message)) {
            self.emit('data', message);
        }
    });

    this.parser.on('error', function (error) {
        self.emit('parser error', error);
    });


    this.recovery = new Recovery({
        max: '30 seconds',
        min: '100 milliseconds',
        retries: 50
    });

    this.recovery.on('reconnect scheduled', function (status) {
        console.log('reconnect scheduled', status);
    });

    this.recovery.on('reconnected', function (status) {
        console.log('reconnected', status);
    });

    this.recovery.on('reconnect failed', function (error, status) {
        console.log('reconnect failed', status);
    });

    this.recovery.on('reconnect timeout', function (error, status) {
        console.log('reconnect timeout', status);
    });

};
Connection.prototype = Object.create(EventEmitter.prototype);



Connection.prototype.stream = function (endpoint, params) {
    
    var self = this;


    if (typeof params != 'object') {
        params = {};
    }



    this.recovery.on('reconnect', function (opts) {

        // Do request against Twitter

        self.request = self.oauth.post(
            endpoints[endpoint],
            self.params.access_token_key,
            self.params.access_token_secret,
            params, 
            null
        );


        // Twitter spec - If no data after 90 sec, destroy connection

        self.request.setTimeout(90000, function () {
            self.emit('connection timeout');
            self.destroy();
        });


        self.request.once('response', function (response) {

            if (abortCodes.indexOf(response.statusCode) !== -1) {
                return self.emit('connection error', {type: 'response', data: {code:response.statusCode}});
            }

            self.recovery.reconnected();
            self.emit('connection success');
            
            response.on('data', function (chunk) {
                if (chunk == newline) {
                    return self.emit('connection keep-alive');
                }
                self.parser.parse(chunk);
            });
            
            response.on('error', function (error) {
                self.emit('connection error', error);
                self.recovery.reconnected(error);
            });

            response.on('close', function () {
                self.request.abort();
            });

        });

        self.request.on('error', function (error) {
            self.emit('connection error', error);
            self.recovery.reconnected(error);
        });
        
        self.request.end();

    });

    this.recovery.reconnect();

};



Connection.prototype.destroy = function () {
    this.emit('connection aborted');
    this.request.abort();
    this.recovery.reconnect();
};
