var WebSocket = require('ws');
var Backoff = require('backoff');

var backoff = Backoff.exponential({
    initialDelay: 10,
    maxDelay: 1000
});

backoff.on('backoff', function (number, delay) {
    console.log('backoff start', number, delay);
});

backoff.on('ready', function (number, delay) {
    console.log('backoff done', number, delay);
});

backoff.backoff();


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