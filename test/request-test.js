/*!
 * test/request-test.js - Request tests for bweb
 * Copyright (c) 2019, Mark Tyneway (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const {Server} = require('../lib/bweb');
const assert = require('bsert');
const {Client} = require('./utils/common');
const Request = require('../lib/request');

const port = 9219;
let client, server;
let seen = false;

describe('Request', function() {
  before(() => {
    server = new Server({
      port: port
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

  it('should construct with default values', async () => {
    server.get('/', async (hreq, hres) => {
      const req = new Request(hreq, hres, hreq.url);

      assert.deepEqual(req.req, hreq);
      assert.deepEqual(req.res, hres);
      assert.deepEqual(req.socket, hreq.socket);
      assert.deepEqual(req.type, 'bin');
      assert.deepEqual(req.url, '/');
      assert.deepEqual(req.pathname, '/');
      assert.deepEqual(req.path, []);
      assert.deepEqual(req.trailing, false);
      assert.deepEqual(req.username, null);
      assert.deepEqual(req.query, Object.create(null));
      assert.deepEqual(req.params, Object.create(null));
      assert.deepEqual(req.body, Object.create(null));
      assert.deepEqual(req.cookies, Object.create(null));
      assert.deepEqual(req.hasBody, false);
      assert.deepEqual(req.readable, true);
      assert.deepEqual(req.writable, false);
      assert.deepEqual(req.admin, false);
      assert.deepEqual(req.wallet, null);

      seen = true;
      return hres.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'GET',
      path: '/'
    });

    assert.equal(seen, true);
    assert.deepEqual(res, '');
  });

  it('should navigate', async () => {
    server.post('/foo', async (hreq, hres) => {
      const req = new Request(hreq, hres, hreq.url);
      req.navigate('/?foo=bar');

      assert.deepEqual(req.url, '/?foo=bar');
      assert.deepEqual(req.pathname, '/');
      assert.deepEqual(req.path, []);

      // Must have null prototype.
      const query = Object.create(null);
      query.foo = 'bar';

      assert.deepEqual(req.query, query);

      seen = true;
      hres.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'POST',
      path: '/foo'
    });

    assert(seen);
    assert.deepEqual(res, '');
  });
});
