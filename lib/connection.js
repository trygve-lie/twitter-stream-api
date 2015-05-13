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
    this.params = params;
    this.oauth  = new OAuth(
        "http://twitter.com/oauth/request_token",
        "http://twitter.com/oauth/access_token", 
        this.params.consumer_key, 
        this.params.consumer_secret, 
        "1.0A", 
        null, 
        "HMAC-SHA1"
    );
    this.request = undefined;
};
Connection.prototype = Object.create(EventEmitter.prototype);



Connection.prototype.stream = function (endpoint, params) {
    
    var self = this,
        parser = new Parser();

    parser.on('data', function (message) {
        if (util.isObject(message)) {
            self.emit('data', message);
        }
    });

    parser.on('error', function (error) {
        self.emit('parser error', error);
    });


    if (typeof params != 'object') {
        params = {};
    }


    var recovery = new Recovery({
        max: '30 seconds',
        min: '100 milliseconds',
        retries: 5
    });


    this.request = this.oauth.post(
        endpoints[endpoint],
        this.params.access_token_key,
        this.params.access_token_secret,
        params, 
        null
    );

    this.request.once('response', function (response) {

        if(response.statusCode > 200) {
            self.emit('response error', {type: 'response', data: {code:response.statusCode}});
          
        } else {

            self.emit('connected');
            response.setEncoding('utf8');
            
            response.on('data', function (chunk) {
                if (chunk == newline) {
                    self.emit('heartbeat');
                    return;
                }
                parser.parse(chunk);
            });
            
            response.on('error', function (error) {
                self.emit('close', error);
            });
            
            response.on('end', function () {
                self.emit('close', 'socket end');
            });

            response.on('close', function () {
                self.request.abort();
            });
        }

    });
    
    this.request.once('close', function () {
        self.emit('request close');
    });

    this.request.on('error', function (error) {
        self.emit('request error', error);
    });
    
    this.request.end();
};



Connection.prototype.destroy = function () {
    this.request.abort();
};
