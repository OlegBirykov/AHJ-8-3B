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

const createInstance = (id) => {
  const instance = {
    id,
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
  let res = {
    event: 'instances',
    data: instances,
  };
  ws.send(JSON.stringify(res));

  ws.on('message', (msg) => {
    const req = JSON.parse(msg);
    let id;

    switch (req.event) {
      case 'ping':
        ws.send(JSON.stringify({ event: 'pong' }));
        break;

      case 'create':
        id = uuid.v4();
        setTimeout(() => createInstance(id), 20000);
        res = {
          event: 'received',
          command: req.event,
          id,
          time: Date.now,
        };
        ws.send(JSON.stringify(res));
        break;

      case 'start':
        setTimeout(() => startInstance(req.id), 20000);
        res = {
          event: 'received',
          command: req.event,
          id: req.id,
          time: Date.now,
        };
        ws.send(JSON.stringify(res));
        break;

      case 'stop':
        setTimeout(() => stopInstance(req.id), 20000);
        res = {
          event: 'received',
          command: req.event,
          id: req.id,
          time: Date.now,
        };
        ws.send(JSON.stringify(res));
        break;

      case 'remove':
        setTimeout(() => removeInstance(req.id), 20000);
        res = {
          event: 'received',
          command: req.event,
          id: req.id,
          time: Date.now,
        };
        ws.send(JSON.stringify(res));
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
