/* jshint node: true, strict: true */

"use strict";

var tap         = require('tap'),
    nock        = require('nock'),
    Connection  = require('../lib/connection.js');


var keys    = {
    consumer_key: "a",
    consumer_secret: "b",
    token: "c",
    token_secret: "d"
};



tap.test('Connection() - constructor has "pool" attribute - "maxSockets" is set in internal request.js Object', function (t) {
    var connection = new Connection(keys, {pool: {maxSockets: 100}});
    var mockResponse = nock('https://sitestream.twitter.com')
                        .get('/1.1/site.json?follow=1&follow=2')
                        .reply(200, 'ok');

    connection.connect('site', {
        follow: ['1', '2']
    }, function () {
        t.equal(connection.request.pool.maxSockets, 100);
        t.end();
    });
});



tap.test('Connection() - constructor has no "pool" attribute - "maxSockets" is "undefined" ', function (t) {
    var connection = new Connection(keys);
    var mockResponse = nock('https://sitestream.twitter.com')
                        .get('/1.1/site.json?follow=1&follow=2')
                        .reply(200, 'ok');

    connection.connect('site', {
        follow: ['1', '2']
    }, function () {
        t.equal(connection.request.pool.maxSockets, undefined);
        t.end();
    });
});
