/*!
 * test/http-test.js - HTTP/1.1 tests for bweb
 * Copyright (c) 2019, Mark Tyneway (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('bsert');
const {Server} = require('../lib/bweb');
const {
  Client,
  resDeepEqual,
  resHeaderDeepEqual,
  sleep
} = require('./utils/common');

const PORT = 9009;
let client, server;
let seen = false;

describe('HTTP/1.1 Tests', function() {
  before(() => {
    server = new Server({
      port: PORT
    });

    client = new Client();

    server.use(server.router());
  });

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
      hostname: '127.0.0.1',
      port: PORT,
      method: 'GET',
      path: '/'
    }, [
      resDeepEqual('httpVersion', '1.1'),
      resDeepEqual('httpVersionMajor', 1),
      resDeepEqual('httpVersionMinor', 1)
    ]);

    assert.deepEqual(res, '');
    assert.equal(seen, true);
  });

  it('should handle GET request', async () => {
    server.get('/', async (req, res) => {
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: PORT,
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
      hostname: '127.0.0.1',
      port: PORT,
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
      hostname: '127.0.0.1',
      port: PORT,
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
      hostname: '127.0.0.1',
      port: PORT,
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
      hostname: '127.0.0.1',
      port: PORT,
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
      hostname: '127.0.0.1',
      port: PORT,
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

  it('should update closed when client closes after request', async () => {
    let closed = null;
    let serverError = null;
    let requestError = null;
    const requestOpts = {
      hostname: '127.0.0.1',
      port: PORT,
      method: 'GET',
      path: '/timeout'
    };

    server.removeAllListeners('error');

    server.on('error', (e) => {
      serverError = e;
    });

    server.on('request', (req, res) => {
      req.on('error', (e) => {
        requestError = e;
      });
    });

    server.get('/timeout', async (req, res) => {
      await sleep(200);
      closed = res.closed;
      return res.end();
    });

    await client.request(requestOpts);
    assert.strictEqual(closed, false);

    let err;
    try {
      await client.request({
        ...requestOpts,
        timeout: 100
      });
    } catch (e) {
      err = e;
    }

    await sleep(300);

    assert(err);
    assert.strictEqual(err.code, 'ECONNRESET');

    assert(serverError);
    assert.strictEqual(serverError.code, 'ECONNRESET');

    assert(requestError);
    assert.strictEqual(requestError.code, 'ECONNRESET');

    assert.strictEqual(closed, true);
  });
});
