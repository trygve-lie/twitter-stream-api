var WebSocket = require('ws');

var Backoff = require('backoff/lib/backoff');
var ExponentialBackoffStrategy = require('backoff/lib/strategy/exponential');
var LinearBackoffStrategy = require('backoff-linear-strategy');


// HTTP errors
var exponential = new Backoff(new LinearBackoffStrategy({
    initialDelay: 500,
    maxDelay: 2000
}));

/*
var exponential = Backoff.exponential({
    initialDelay: 500,
    maxDelay: 320000
});
*/

exponential.failAfter(10);


var client = function (backout) {
    var ws = new WebSocket('ws://localhost:8080/');

    ws.on('open', function () {
        console.log('client opened');
        ws.send('client says hello');
        backout.reset();
    });

    ws.on('message', function(data, flags) {
        console.log('client message:', data);
    });

    ws.on('error', function (error) {
        console.log('client error');
        backout.backoff();
    });

    ws.on('close', function (ev) {
        console.log('client closed');
        backout.backoff();
    });

    return ws;
};

var ws = client(exponential);

exponential.on('backoff', function (number, delay) {
    console.log('backoff start', number, delay);
});

exponential.on('ready', function (number, delay) {
    console.log('backoff done', number, delay);
    ws = client(exponential);
    /*
    if (number < 15) {
        // backoff.backoff();
        ws = client(exponential);
    }
    */
});

exponential.on('fail', function () {
    console.log('fail');
});




















/*
recovery.on('reconnect scheduled', function (status) {
    console.log('reconnect scheduled', status);
});


recovery.on('reconnect', function (opts) {
    console.log(opts.attempt);

    var ws = new WebSocket('ws://localhost:8080/');

    ws.on('open', function () {
        console.log('client opened');
        recovery.reconnected();
        ws.send('client says hello');
    });

    ws.on('message', function(data, flags) {
      console.log('client message:', data);
    });

    ws.on('error', function (error) {
        console.log('client error:', error);
        recovery.reconnected(error);
    });

    ws.on('close', function (ev) {
        console.log('client closed');
        recovery.reconnect();
    });

});


console.log(recovery);


recovery.on('reconnected', function (status) {
    console.log('reconnected', status);
});


recovery.on('reconnect failed', function (error, status) {
    console.log('reconnect failed', status);
});


recovery.on('reconnect timeout', function (error, status) {
    console.log('reconnect timeout', status);
});


recovery.reconnect();


setInterval(function () {

}, 1000);
*/