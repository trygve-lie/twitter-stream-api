/* jshint node: true, strict: true */

"use strict";


var TwitterStream = require('../'),
    through = require('through2');



var TwitterDev1 = new TwitterStream({ 
    consumer_key: '',
    consumer_secret: '',
    token: '',
    token_secret: '' 
});

TwitterDev1.debug(function (reqObj) {
    require('request-debug')(reqObj, function (type, data, r) {
        console.log('type', type);
//        console.log('data', data);
//        console.log('r', r);
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


TwitterDev1.on('data', function (obj) {
    console.log(obj.id, obj.text);
});


/*
TwitterDev1.pipe(through({ objectMode: true }, function (obj, enc, callback) {
    console.log(obj.id, obj.text);
    this.push(obj);
    callback();
 }, function (callback) {
    console.log('I flushed!!');
    callback();
}));
*/