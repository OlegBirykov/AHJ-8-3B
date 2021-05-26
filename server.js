const http = require('http');
const WS = require('ws');

const port = process.env.PORT || 7070;
const server = http.createServer();
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const req = JSON.parse(msg);
    let res;

    switch (req.event) {
      case 'ping':
        res = {
          event: 'pong',
        };
        ws.send(JSON.stringify(res));
        break;

      default:
    }
  });

  ws.on('close', () => {
  });
});

server.listen(port);
