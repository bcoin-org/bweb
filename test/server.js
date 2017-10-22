'use strict';

const Path = require('path');
const request = require('../lib/request');
const bweb = require('../');

const server = bweb.server({
  port: 8080,
  sockets: true
});

server.use('/', server.bodyParser());
server.use('/', server.jsonRPC());
server.use('/', server.router());
server.use('/static', server.file(Path.resolve(__dirname, '..')));

server.get('/', (req, res) => {
  res.html(200, '<a href="/static">static</a>');
});

server.add('test', async () => {
  return { foo: 'bar' };
});

server.on('error', (err) => {
  console.error(err.stack);
});

(async () => {
  await server.open();
  return;
  const res = await request({
    method: 'POST',
    url: 'http://localhost:8080',
    json: {
      method: 'test',
      params: {}
    }
  });
  console.log(res.json());
})().catch((err) => {
  console.error(err.stack);
  process.exit(0);
});
