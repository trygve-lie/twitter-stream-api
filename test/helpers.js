/* jshint node: true, strict: true */

"use strict";

var tap     = require('tap'),
    helpers = require('../lib/helpers.js');



tap.test('helpers.parseParams() - parameters is not an Object - shall return null', function (t) {
    var conf = "gibberish";
    var result = helpers.parseParams(conf);
    t.type(result, 'null');
    t.end();
});



tap.test('helpers.parseParams() - parameters is an empty Object - shall return null', function (t) {
    var conf = {};
    var result = helpers.parseParams(conf);
    t.type(result, 'null');
    t.end();
});



tap.test('helpers.parseParams() - parameters is not an empty Object - shall not return the same Object', function (t) {
    var conf = {
        stall_warnings  : true,
        follow          : ['123'],
        track           : ['abc'],
        locations       : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'object');
    t.notSame(result, conf);
    t.end();
});



tap.test('helpers.parseParams() - "track", "follow" and "locations" has Arrays as values - shall return copied Object where these values are Strings', function (t) {
    var conf = {
        stall_warnings  : true,
        follow          : ['123'],
        track           : ['abc'],
        locations       : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'object');
    t.type(result.follow, 'string');
    t.type(result.track, 'string');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "track", "follow" and "locations" has Strings as values - shall return copied Object where these values are Strings', function (t) {
    var conf = {
        stall_warnings  : true,
        follow          : '123',
        track           : 'abc',
        locations       : '-74,40,-73,41'
    };
    var result = helpers.parseParams(conf);
    t.type(result, 'object');
    t.type(result.follow, 'string');
    t.type(result.track, 'string');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "stall_warnings" has Boolean value - shall return copied Object where "stall_warnings" has Boolean value', function (t) {
    var conf = {
        stall_warnings  : true,
        follow          : ['123'],
        track           : ['abc'],
        locations       : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.stall_warnings, 'boolean');
    t.end();
});


tap.test('helpers.parseParams() - "follow" is not set - shall return copied Object without "follow"', function (t) {
    var conf = {
        track       : ['abc'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'undefined');
    t.type(result.track, 'string');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "track" is not set - shall return copied Object without "track"', function (t) {
    var conf = {
        follow      : ['123'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'string');
    t.type(result.track, 'undefined');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "locations" is not set - shall return copied Object without "locations"', function (t) {
    var conf = {
        follow      : ['123'],
        track       : ['abc']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'string');
    t.type(result.track, 'string');
    t.type(result.locations, 'undefined');
    t.end();
});



tap.test('helpers.parseParams() - "follow" is an empty Array - shall return copied Object without "follow"', function (t) {
    var conf = {
        follow      : [],
        track       : ['abc'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'undefined');
    t.type(result.track, 'string');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "track" is an empty Array - shall return copied Object without "track"', function (t) {
    var conf = {
        follow      : ['123'],
        track       : [],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'string');
    t.type(result.track, 'undefined');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "locations" is an empty Array - shall return copied Object without "locations"', function (t) {
    var conf = {
        follow      : ['123'],
        track       : ['abc'],
        locations   : []
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'string');
    t.type(result.track, 'string');
    t.type(result.locations, 'undefined');
    t.end();
});



tap.test('helpers.parseParams() - "follow", "track" and "locations" have multiple entries in the Array - values shall be joined with a ","', function (t) {
    var conf = {
        follow      : ['123','456','789'],
        track       : ['abc','def','ghi'],
        locations   : ['-74,40,-73,41','-74,60,-73,61','-74,80,-73,81']
    };
    var result = helpers.parseParams(conf);
    t.equal(result.follow, '123,456,789');
    t.equal(result.track, 'abc,def,ghi');
    t.equal(result.locations, '-74,40,-73,41,-74,60,-73,61,-74,80,-73,81');
    t.end();
});



tap.test('helpers.parseParams() - "follow" is an empty String - shall return copied Object without "follow"', function (t) {
    var conf = {
        follow      : '',
        track       : ['abc'],
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'undefined');
    t.type(result.track, 'string');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "track" is an empty Array - shall return copied Object without "track"', function (t) {
    var conf = {
        follow      : ['123'],
        track       : '',
        locations   : ['-74,40,-73,41']
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'string');
    t.type(result.track, 'undefined');
    t.type(result.locations, 'string');
    t.end();
});



tap.test('helpers.parseParams() - "locations" is an empty Array - shall return copied Object without "locations"', function (t) {
    var conf = {
        follow      : ['123'],
        track       : ['abc'],
        locations   : ''
    };
    var result = helpers.parseParams(conf);
    t.type(result.follow, 'string');
    t.type(result.track, 'string');
    t.type(result.locations, 'undefined');
    t.end();
});
