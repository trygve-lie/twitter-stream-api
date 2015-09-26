/* jshint node: true, strict: true */

"use strict";

var tap     = require('tap'),
    helpers = require('../lib/helpers.js');



tap.test('helpers.parseParams() - parameters is not an Object - shall return empty String', function (t) {
    var conf = "gibberish";
    var result = helpers.parseParams(conf);
    t.type(result, 'string');
    t.equal(result, '');
    t.end();
});



tap.test('helpers.parseParams() - parameters is an empty Object - shall return empty String', function (t) {
    var conf = {};
    var result = helpers.parseParams(conf);
    t.type(result, 'string');
    t.equal(result, '');
    t.end();
});



tap.test('helpers.parseParams() - all parameter Object keys set as Arrays with values - shall return legal querystring', function (t) {
    var conf = {
        follow      : ['123'],
        track       : ['abc'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'string');
    t.equal(result, 'follow=123&track=abc&locations=-74%2C40%2C-73%2C41');
    t.end();
});



tap.test('helpers.parseParams() - "follow" is not set - shall return legal querystring without "follow"', function (t) {
    var conf = {
        track       : ['abc'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'string');
    t.equal(result, 'track=abc&locations=-74%2C40%2C-73%2C41');
    t.end();
});



tap.test('helpers.parseParams() - "track" is not set - shall return legal querystring without "track"', function (t) {
    var conf = {
        follow      : ['123'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'string');
    t.equal(result, 'follow=123&locations=-74%2C40%2C-73%2C41');
    t.end();
});



tap.test('helpers.parseParams() - "locations" is not set - shall return legal querystring without "locations"', function (t) {
    var conf = {
        follow      : ['123'],
        track       : ['abc']
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'string');
    t.equal(result, 'follow=123&track=abc');
    t.end();
});


