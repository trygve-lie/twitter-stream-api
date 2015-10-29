/* jshint node: true, strict: true */

"use strict";

var tap             = require('tap'),
    TwitterStream   = require('../lib/main.js');


var keys    = {
    consumer_key: "a",
    consumer_secret: "b",
    token: "c",
    token_secret: "d"
};



tap.test('Main() - no rest attributes set - "objectMode" should be "true" - "options" should be empty Object', function (t) {
    var Twitter = new TwitterStream(keys);
    t.equal(Twitter._readableState.objectMode, true);
    t.same(Twitter.connection.options, {});
    t.end();
});


tap.test('Main() - 1st rest attribute is "true" - "objectMode" should be "true" - "options" should be empty Object', function (t) {
    var Twitter = new TwitterStream(keys, true);
    t.equal(Twitter._readableState.objectMode, true);
    t.same(Twitter.connection.options, {});
    t.end();
});


tap.test('Main() - 1st rest attribute is "false" - "objectMode" should be "false" - "options" should be empty Object', function (t) {
    var Twitter = new TwitterStream(keys, false);
    t.equal(Twitter._readableState.objectMode, false);
    t.same(Twitter.connection.options, {});
    t.end();
});


tap.test('Main() - 1st rest attribute is a Object - "objectMode" should be "true" - "options" should be same Object', function (t) {
    var Twitter = new TwitterStream(keys, {gzip : true});
    t.equal(Twitter._readableState.objectMode, true);
    t.same(Twitter.connection.options, {gzip : true});
    t.end();
});


tap.test('Main() - 1st rest attribute is "true" - 2nd rest attribute is an Object - "objectMode" should be "true" - "options" should be same Object', function (t) {
    var Twitter = new TwitterStream(keys, true, {gzip : true});
    t.equal(Twitter._readableState.objectMode, true);
    t.same(Twitter.connection.options, {gzip : true});
    t.end();
});


tap.test('Main() - 1st rest attribute is "false"  - 2nd rest attribute is an Object - "objectMode" should be "true" - "options" should be same Object', function (t) {
    var Twitter = new TwitterStream(keys, false, {gzip : true});
    t.equal(Twitter._readableState.objectMode, false);
    t.same(Twitter.connection.options, {gzip : true});
    t.end();
});
