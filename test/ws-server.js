var WebSocketServer = require('ws').Server, 
	wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('server:', message);
  });

  ws.send('server says hello');
});