/* jshint node: true, strict: true */

"use strict";


var Writable        = require('stream').Writable,
    TwitterStream   = require('../'),
    fs              = require('fs'),
    keysString      = fs.readFileSync('./keys.json'),
    keys            = JSON.parse(keysString);



// Helper for outputting stream to console

var Output = Writable({objectMode: true});
Output._write = function (obj, enc, next) {
    console.log(obj.id, obj.text);
    next();
};



var Twitter = new TwitterStream(keys);

Twitter.stream('statuses/sample');

Twitter.on('connection success', function (uri) {
    console.log('connection success', uri);
});

Twitter.on('connection aborted', function () {
    console.log('connection aborted');
});

Twitter.on('connection error network', function () {
    console.log('connection error network');
});

Twitter.on('connection error stall', function () {
    console.log('connection error stall');
});

Twitter.on('connection error http', function () {
    console.log('connection error http');
});

Twitter.on('connection rate limit', function () {
    console.log('connection rate limit');
});

Twitter.on('connection error unknown', function () {
    console.log('connection error unknown');
});

Twitter.on('data keep-alive', function () {
    console.log('data keep-alive');
});

Twitter.on('data error', function () {
    console.log('data error');
});

Twitter.pipe(Output);
