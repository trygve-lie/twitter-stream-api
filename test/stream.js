/* jshint node: true, strict: true */

"use strict";


var TwitterStream = require('../'),
    through = require('through2');




var keys = {
    consumer_key:undefined,
    consumer_secret:undefined,
    access_token_key:undefined,
    access_token_secret:undefined
};


var Twitter = new TwitterStream(keys);
Twitter.stream('public', {
    follow: '2840926455,65706552',
    track: 'javascript'
});

/*
setTimeout(function () {
	Twitter.close();
}, 6000);
*/


// Emitted events example
/*
Twitter.on('data', function (data) {
  console.log('data', data);
});
Twitter.on('end', function () {
  console.log('stream end');
});
*/


// Pipe example

Twitter.pipe(through({ objectMode: true }, function (obj, enc, callback) {
    console.log(obj.id);
    this.push(obj);
    callback();
 }));
