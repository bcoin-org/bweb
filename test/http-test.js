/**
 *
 */

const assert = require('bsert');
const qs = require('querystring');
const {Server} = require('../lib/bweb');
const {
  Client,
  resDeepEqual,
  resHeaderDeepEqual
} = require('./utils/common');

const port = 9009;

let client, server;
let seen = false;
describe('HTTP/1.1 Tests', function() {
  before(() => {
    server = new Server({
      port: port,
    });

    client = new Client();

    server.use(server.router());
  })

  beforeEach(async () => {
    server.on('error', async (err) => {
      assert.fail(err);
    });

    await server.open();
  });

  afterEach(async () => {
    await server.close();
    seen = false;
  });

  it('should use HTTP/1.1', async () => {
    server.get('/', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/'
    }, [
      resDeepEqual('httpVersion', '1.1'),
      resDeepEqual('httpVersionMajor', 1),
      resDeepEqual('httpVersionMinor', 1)
    ]);
  });

  it('should handle GET request', async () => {
    server.get('/', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/'
    }, [
      resHeaderDeepEqual('content-length', '0'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK')
    ]);

    assert.deepEqual(res, '');
    assert.equal(seen, true);
  });

  it('should handle POST request', async () => {
    server.post('/foo', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'POST',
      path: '/foo'
    }, [
      resHeaderDeepEqual('content-length', '0'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK')
    ]);

    assert.deepEqual(res, '');
    assert.equal(seen, true);
  });

  it('should handle PUT request', async () => {
    server.put('/bar', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'PUT',
      path: '/bar'
    }, [
      resHeaderDeepEqual('content-length', '0'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK')
    ]);

    assert.deepEqual(res, '');
    assert.equal(seen, true);
  });

  it('should handle DELETE request', async () => {
    server.del('/lol', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'DELETE',
      path: '/lol'
    }, [
      resHeaderDeepEqual('content-length', '0'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK')
    ]);

    assert.deepEqual(res, '');
    assert.equal(seen, true);
  });

  it('should handle PATCH request', async () => {
    server.patch('/test', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'PATCH',
      path: '/test'
    }, [
      resHeaderDeepEqual('content-length', '0'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK')
    ]);

    assert.deepEqual(res, '');
    assert.equal(seen, true);
  });

  it('should handle unknown request', async () => {
    server.get('/foobar', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'POST',
      path: '/'
    }, [
      resHeaderDeepEqual('content-length', '16'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 404),
      resDeepEqual('statusMessage', 'Not Found')
    ]);

    assert.deepEqual(res, 'HTTP Error: 404.');
    assert.equal(seen, false);
  });
});
