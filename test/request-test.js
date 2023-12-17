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
const Router = require('../lib/router');

const port = 9219;
let client, server, routes;
let seen = false;

describe('Request', function() {
  before(() => {
    server = new Server({
      port: port,
      sockets: false
    });

    client = new Client();
    routes = new Router();

    server.use(server.router());
    server.use('/routes', server.router(routes));
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

  it('should GET /', async () => {
    server.get('/', async (req, res) => {
      assert.strictEqual(req.type, 'bin');
      assert.strictEqual(req.url, '/');
      assert.strictEqual(req.pathname, '/');
      assert.deepStrictEqual(req.path, []);
      assert.strictEqual(req.trailing, false);
      assert.strictEqual(req.username, null);
      assert.deepStrictEqual(req.query, Object.create(null));
      assert.deepStrictEqual(req.params, Object.create(null));
      assert.deepStrictEqual(req.body, Object.create(null));
      assert.deepStrictEqual(req.cookies, Object.create(null));
      assert.strictEqual(req.hasBody, false);
      assert.strictEqual(req.readable, true);
      assert.strictEqual(req.writable, false);
      assert.strictEqual(req.admin, false);
      assert.strictEqual(req.wallet, null);

      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'GET',
      path: '/'
    });

    assert.strictEqual(seen, true);
    assert.strictEqual(res, '');
  });

  it('should GET /foo', async () => {
    server.get('/foo', async (req, res) => {
      assert.strictEqual(req.url, '/foo');
      assert.strictEqual(req.pathname, '/foo');
      assert.deepStrictEqual(req.path, ['foo']);
      assert.strictEqual(req.trailing, true);
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'GET',
      path: '/foo/'
    });

    assert.strictEqual(seen, true);
    assert.strictEqual(res, '');
  });

  it('should navigate', async () => {
    server.post('/foo/bar', async (hreq, hres) => {
      const req = new Request(hreq, hres, hreq.url);
      req.navigate('bar');

      assert.strictEqual(req.url, '/foo/bar?a=1');
      assert.strictEqual(req.pathname, '/bar');
      assert.deepStrictEqual(req.path, ['bar']);

      // Must have null prototype.
      const query = Object.create(null);
      query.a = '1';

      assert.deepStrictEqual(req.query, query);

      seen = true;
      hres.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'POST',
      path: '/foo/bar?a=1'
    });

    assert.strictEqual(seen, true);
    assert.strictEqual(res, '');
  });

  it('should GET /routes', async () => {
    routes.get('/', async (req, res) => {
      assert.strictEqual(req.type, 'bin');
      assert.strictEqual(req.url, '/routes');
      assert.strictEqual(req.pathname, '/');
      assert.deepStrictEqual(req.path, []);
      assert.strictEqual(req.trailing, false);
      assert.strictEqual(req.username, null);
      assert.deepStrictEqual(req.query, Object.create(null));
      assert.deepStrictEqual(req.params, Object.create(null));
      assert.deepStrictEqual(req.body, Object.create(null));
      assert.deepStrictEqual(req.cookies, Object.create(null));
      assert.strictEqual(req.hasBody, false);
      assert.strictEqual(req.readable, true);
      assert.strictEqual(req.writable, false);
      assert.strictEqual(req.admin, false);
      assert.strictEqual(req.wallet, null);

      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'GET',
      path: '/routes'
    });

    assert.strictEqual(seen, true);
    assert.strictEqual(res, '');
  });

  it('should GET /routes/foo', async () => {
    routes.get('/foo', async (req, res) => {
      assert.strictEqual(req.url, '/routes/foo');
      assert.strictEqual(req.pathname, '/foo');
      assert.deepStrictEqual(req.path, ['foo']);
      assert.strictEqual(req.trailing, true);
      seen = true;
      return res.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'GET',
      path: '/routes/foo/'
    });

    assert.strictEqual(seen, true);
    assert.strictEqual(res, '');
  });

  it('should navigate', async () => {
    routes.post('/foo/bar', async (hreq, hres) => {
      const req = new Request(hreq, hres, hreq.url);
      req.navigate('bar');

      assert.strictEqual(req.url, '/routes/foo/bar?a=1');
      assert.strictEqual(req.pathname, '/bar');
      assert.deepStrictEqual(req.path, ['bar']);

      // Must have null prototype.
      const query = Object.create(null);
      query.a = '1';

      assert.deepStrictEqual(req.query, query);

      seen = true;
      hres.end();
    });

    const res = await client.request({
      hostname: '127.0.0.1',
      port: port,
      headers: {},
      method: 'POST',
      path: '/routes/foo/bar?a=1'
    });

    assert.strictEqual(seen, true);
    assert.strictEqual(res, '');
  });
});
