/* jshint node: true, strict: true */

"use strict";

var pckage          = require('../package.json'),
    querystring     = require('querystring'),
    EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    request         = require('request'),
    utils           = require('core-util-is'),
    Parser          = require('./parser.js'),

    endpoints = {
        'statuses/sample' : {uri : 'https://stream.twitter.com/1.1/statuses/sample.json', method : 'get'},
        'statuses/filter' : {uri : 'https://stream.twitter.com/1.1/statuses/filter.json', method : 'post'},
        'statuses/firehose' : {uri : 'https://stream.twitter.com/1.1/statuses/firehose.json', method : 'get'},
        'user' : {uri : 'https://userstream.twitter.com/1.1/user.json', method : 'get'},
        'site' : {uri : 'https://sitestream.twitter.com/1.1/site.json', method : 'get'}
    },
    newline = '\r\n',
    abortCodes = [401, 403, 404, 406, 412, 413, 416, 503];



var Connection = module.exports = function (keys, options) {
    var self = this;

    this.keys = keys;
    this.options = options;
    this.request = undefined;


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
    
    var uri = endpoints[endpoint].uri + '?' + querystring.stringify(params),
        self = this,
        conf = { 
            headers: {
                'User-Agent': pckage.name + '/' + pckage.version + ', node.js',
                'content-length': '0'
            },
            url: uri,
            encoding : 'utf8',
            oauth: self.keys
        };


    // Merge constructor options into request config Object

    if (!utils.isNullOrUndefined(self.options)) {
        Object.keys(self.options).forEach(function (key) {
            if (key === 'pool' || key === 'gzip') {
                conf[key] = self.options[key];
            }
        });
    }


    // Input parameters is invalid

    if (utils.isNullOrUndefined(params)) {
        return self.emit('connection error unknown', new Error('Illegal stream parameters provided'));
    }


    // Do request against Twitter

    if (endpoints[endpoint].method === 'post') {
        self.request = request.post(conf);
    } else {
        self.request = request.get(conf);
    }
    

    // Connection has stalled if data has not received after 90 seconds
/*
    self.request.setTimeout(90000, function () {
        self.emit('connection error stall');
        self.destroy();
    });
*/

    self.request.on('response', function (response) {

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


        self.emit('connection success', uri);
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
            self.emit('connection response close');
            self.request.abort();
        });

    });

    self.request.on('error', function (error) {
        self.emit('connection error network', error);
    });

    self.request.on('close', function () {
//        self.emit('connection error network', error);
//        console.log('request close');
    });

    self.request.end();
};



Connection.prototype.destroy = function () {
    this.emit('connection aborted');
    this.request.abort();
};



Connection.prototype.debug = function () {
    return request;
};
