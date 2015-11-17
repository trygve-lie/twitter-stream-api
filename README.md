# twitter-stream-api

[![Dependencies](https://img.shields.io/david/trygve-lie/twitter-stream-api.svg?style=flat-square)](https://david-dm.org/trygve-lie/twitter-stream-api)[![Build Status](http://img.shields.io/travis/trygve-lie/twitter-stream-api/master.svg?style=flat-square)](https://travis-ci.org/trygve-lie/twitter-stream-api)


A streaming [Twitter Stream API](https://dev.twitter.com/streaming/overview) 
client with extended exposure of the underlaying protocol events. It does also 
fully adhere to Twitters different reconnect rules.



## Installation

```bash
$ npm install twitter-stream-api
```


## Simple stream usage

Connect to the Twitter stream API and listen for messages containing the word 
"javascript".

```js
var TwitterStream = require('twitter-stream-api'),
    fs = require('fs');

var keys = {
    consumer_key : "your_consumer_key",
    consumer_secret : "your_consumer_secret",
    token : "your_access_token_key",
    token_secret : "your_access_token_secret"
};

var Twitter = new TwitterStream(keys, false);
Twitter.stream('statuses/filter', {
    track: 'javascript'
});

Twitter.pipe(fs.createWriteStream('tweets.json'));
```



## Constructor

Create a new Twitter Stream API instance.

```js
var Twitter = new TwitterStream(keys, [objectMode, options]);
```


### keys (required)

Takes an Object containing your Twitter API keys and access tokens. The Object 
are as follow:

```js
{
    consumer_key : "your_consumer_key",
    consumer_secret : "your_consumer_secret",
    token : "your_access_token_key",
    token_secret : "your_access_token_secret"
}
```

Twitter API keys and tokens can be [generated here](https://apps.twitter.com/).


### objectMode (optional)

Boolean value for controlling if the stream should emit Objects or not. Default
value is `true` which set the stream to emit Objects. If a non-object stream is
wanted, set the value to `false`.


### options (optional)

An Object containing misc configuration. The following values can be provided:

 * gzip - Boolean value for enabling / disabling gzip on the connection against Twitter.
 * pool - Sets pool configuration on the underlaying request.js object.

Please refere to [request.js](https://github.com/request/request) for further
documentation on these cunfiguration options.



## API

The Twitter Stream API instance have the following API:


### .stream(endpoint, parameters)

Opens a connection to a given stream endpoint.


#### endpoint (required)

The following values can be provided:

 * `statuses/filter` [API Doc](https://dev.twitter.com/streaming/reference/post/statuses/filter)
 * `statuses/sample` [API Doc](https://dev.twitter.com/streaming/reference/get/statuses/sample)
 * `statuses/firehose` [API Doc](https://dev.twitter.com/streaming/reference/get/statuses/firehose)
 * `user` [API Doc](https://dev.twitter.com/streaming/reference/get/user)
 * `site` [API Doc](https://dev.twitter.com/streaming/reference/get/site)


#### parameters (required)

Object holding optional Twitter Stream API endpoint parameters. The Twitter 
Stream API endpoints can take a set of given parameters which can be found in
the API documentation for each endpoint.

Example:

The `statuses/filter` endpoint can take a [`track`](https://dev.twitter.com/streaming/reference/post/statuses/filter)
parameter for tracking tweets on keywords. The same endpoint can also take a 
`stall_warnings` parameter to include stall warnings in the Twitter stream.

To track the keyword `javascript` and include stall warnings, do as follow:

```js
Twitter.stream('statuses/filter', {
    track: 'javascript',
    stall_warnings: true
});
```

Do note that the `track` and `follow` parameters can take both a comma separated
list of values or an Array of values.

```js
Twitter.stream('statuses/filter', {
    track: 'javascript,rust'
});
```

is the same as:

```js
Twitter.stream('statuses/filter', {
    track: ['javascript','rust']
});
```


### .close()

Closes the connection against the Twitter Stream API.


### .debug(callback)

Under the hood this client use [request](https://github.com/request/request) to
connect to the Twitter Stream API. Request have several tools for debugging its
connection(s). This method provide access to the underlaying request object so
one can plug in a debugger to [request](https://github.com/request/request).

The underlaying request object are available as the first argument on the 
callback.

Example using [request-debug](https://github.com/request/request-debug):

```js
var Twitter = new TwitterStream(keys);

Twitter.debug(function (reqObj) {
    require('request-debug')(reqObj, function (type, data, req) {
        console.log(type, data, req);
    });
});
```



## Events

twitter-stream-api expose a rich set of events making it possible to monitor and
take action upon what is going on under the hood. 


### connection success

Emitted when a successfull connection to the Twitter Stream API are established.

```js
Twitter.on('connection success', function (uri) {
    console.log('connection success', uri);
});
```


### connection aborted

Emitted when a the connection to the Twitter Stream API are taken down / closed.

```js
Twitter.on('connection aborted', function () {
    console.log('connection aborted');
});
```


### connection error network

Emitted when the connection to the Twitter Stream API have TCP/IP level network 
errors. This error event are normally emitted if there are network level errors
during the connection process.

```js
Twitter.on('connection error network', function (error) {
    console.log('connection error network', error);
});
```

When this event is emitted a linear reconnect will start. The reconnect will
attempt a reconnect after 250 milliseconds and increase the reconnect attempts
linearly up to 16 seconds.


### connection error stall

Emitted when the connection to the Twitter Stream API have been flagged as stall.
A stall connection is a connection which have not received any new data or keep 
alive messages from the Twitter Stream API during a period of 90 seconds.

This error event are normally emitted when a connection have been established
but there has been a drop in it after a while.

```js
Twitter.on('connection error stall', function () {
    console.log('connection error stall');
});
```

When this event is emitted a linear reconnect will start. The reconnect will
attempt a reconnect after 250 milliseconds and increase the reconnect attempts 
linearly up to 16 seconds.


### connection error http

Emitted when the connection to the Twitter Stream API return an HTTP error code.

This error event are normally emitted if there are HTTP errors during the 
connection process.

```js
Twitter.on('connection error http', function (httpStatusCode) {
    console.log('connection error http', httpStatusCode);
});
```

When this event is emitted a exponentially reconnect will start. The reconnect 
will attempt a reconnect after 5 seconds and increase the reconnect attempts
exponentially up to 320 seconds.


### connection rate limit

Emitted when the connection to the Twitter Stream API are being rate limited.
Twitter does only allow one connection for each application to its Stream API.Multiple connections or to rappid reconnects will cause a rate limiting to 
happen.

```js
Twitter.on('connection rate limit', function (httpStatusCode) {
    console.log('connection rate limit', httpStatusCode);
});
```

When this event is emitted a exponentially reconnect will start. The reconnect 
will attempt a reconnect after 1 minute and double the reconnect attempts
exponentially.


### connection error unknown

Emitted when the connection to the Twitter Stream API throw an unexpected error 
which are not within the errors defined by the Twitter Stream API documentation.

```js
Twitter.on('connection error unknown', function (error) {
    console.log('connection error unknown', error);
    Twitter.close();
});
```

When this event is emitted the client will, if it can, keep the connection to
the Twitter Stream API and not attemt to reconnect. Closing the connection 
and handling a possilbe reconnect must be handled by the consumer of the client.


### data

Emitted when a Tweet ocur in the stream.

```js
Twitter.on('data', function (obj) {
    console.log('data', obj);
});
```


### data keep-alive

Emitted when the client receive a keep alive message from the Twitter Stream API.
The Twitter Stream API sends a keep alive message every 30 second if no messages
have been sendt to ensure that the connection are kept open. This keep alive
messages are mostly being used under the hood to detect stalled connections and
other connection issues.

```js
Twitter.on('data keep-alive', function () {
    console.log('data keep-alive');
});
```


### data error

Emitted if the client received an message from the Twitter Stream API which the
client could not parse into an object or handle in some other way.

```js
Twitter.on('data error', function (error) {
    console.log('data error', error);
});
```



## License 

The MIT License (MIT)

Copyright (c) 2015 - Trygve Lie - post@trygve-lie.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
