/* jshint node: true, strict: true */

"use strict";


var TwitterStream = require('../'),
    Writable = require('stream').Writable;



var Output = Writable({objectMode: true});
Output._write = function (chunk, enc, next) {
    console.log(chunk.id, chunk.text);
    next();
};



var TwitterDev1 = new TwitterStream({ 
    consumer_key: '',
    consumer_secret: '',
    token: '',
    token_secret: '' 
}, true);

TwitterDev1.debug(function (reqObj) {
    require('request-debug')(reqObj, function (type, data, r) {
        console.log('type', type);
    });
});

TwitterDev1.stream('statuses/filter', {
    follow: '2840926455,65706552',
    track: ['javascript', 'syria'],
    stall_warnings : true
});

TwitterDev1.on('connection success', function (uri) {
    console.log('dev1', 'connection success', uri);
});

TwitterDev1.on('connection aborted', function () {
    console.log('dev1', 'connection aborted');
});

TwitterDev1.on('connection error network', function () {
    console.log('dev1', 'connection error network');
});

TwitterDev1.on('connection error stall', function () {
    console.log('dev1', 'connection error stall');
});

TwitterDev1.on('connection error http', function () {
    console.log('dev1', 'connection error http');
});

TwitterDev1.on('connection rate limit', function () {
    console.log('dev1', 'connection rate limit');
});

TwitterDev1.on('connection error unknown', function () {
    console.log('dev1', 'connection error unknown');
});

TwitterDev1.on('data keep-alive', function () {
    console.log('dev1', 'data keep-alive');
});

TwitterDev1.on('data error', function () {
    console.log('dev1', 'data error');
});

TwitterDev1.pipe(Output);
