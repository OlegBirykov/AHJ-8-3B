const http = require('http');
const WS = require('ws');
const uuid = require('uuid');

const instances = [];

const port = process.env.PORT || 7070;
const server = http.createServer();
const wsServer = new WS.Server({ server });

const groupSend = (res) => {
  Array.from(wsServer.clients)
    .filter((o) => o.readyState === WS.OPEN)
    .forEach((o) => o.send(JSON.stringify(res)));
};

const createInstance = () => {
  const instance = {
    id: uuid.v4(),
    state: 'stopped',
  };
  instances.push(instance);

  const res = {
    event: 'created',
    id: instance.id,
    time: Date.now(),
  };
  groupSend(res);
};

const startInstance = (id) => {
  const index = instances.findIndex((item) => item.id === id);
  if (index < 0) {
    return;
  }
  instances[index].state = 'running';

  const res = {
    event: 'started',
    id,
    time: Date.now,
  };
  groupSend(res);
};

const stopInstance = (id) => {
  const index = instances.findIndex((item) => item.id === id);
  if (index < 0) {
    return;
  }
  instances[index].state = 'stopped';

  const res = {
    event: 'stopped',
    id,
    time: Date.now,
  };
  groupSend(res);
};

const removeInstance = (id) => {
  const index = instances.findIndex((item) => item.id === id);
  if (index < 0) {
    return;
  }
  instances.splice(index, 1);

  const res = {
    event: 'removed',
    id,
    time: Date.now,
  };
  groupSend(res);
};

wsServer.on('connection', (ws) => {
  const res = {
    event: 'instances',
    data: instances,
  };
  ws.send(JSON.stringify(res));

  ws.on('message', (msg) => {
    const req = JSON.parse(msg);

    switch (req.event) {
      case 'ping':
        ws.send(JSON.stringify({ event: 'pong' }));
        break;

      case 'create':
        setInterval(createInstance, 20000);
        ws.send(JSON.stringify({ event: 'received' }));
        break;

      case 'start':
        setInterval(() => startInstance(req.id), 20000);
        ws.send(JSON.stringify({ event: 'received' }));
        break;

      case 'stop':
        setInterval(() => stopInstance(req.id), 20000);
        ws.send(JSON.stringify({ event: 'received' }));
        break;

      case 'remove':
        setInterval(() => removeInstance(req.id), 20000);
        ws.send(JSON.stringify({ event: 'received' }));
        break;

      default:
    }
  });

  ws.on('error', () => {
    ws.close();
  });

  ws.on('close', () => {
  });
});

server.listen(port);
