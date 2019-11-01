/*!
 * test/response-test.js - Response tests for bweb
 * Copyright (c) 2019, Mark Tyneway (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('bsert');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {Server} = require('../lib/bweb');
const {
  Client,
  resDeepEqual,
  resHeaderDeepEqual
} = require('./utils/common');

const port = 9119;
let client, server;
let seen = false;

describe('Response', function() {
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

  it('should return json', async () => {
    const json = {foo: 'bar'};

    server.get('/foo', async (req, res) => {
      seen = true;
      return res.json(200, json);
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/foo'
    }, [
      resHeaderDeepEqual('content-length', '19'),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK'),
      resHeaderDeepEqual('content-type', 'application/json; charset=utf-8')
    ]);

    assert.deepEqual(json, res);
    assert.deepEqual(seen, true);
  });

  it('should return text data', async () => {
    const str = 'foobar';

    server.get('/text', async (req, res) => {
      seen = true;
      return res.text(200, str);
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/text'
    }, [
      resHeaderDeepEqual('content-length', str.length.toString()),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK'),
      resHeaderDeepEqual('content-type', 'text/plain; charset=utf-8')
    ]);

    assert.deepEqual(str, res);
    assert.deepEqual(seen, true);
  });

  it('should return buffer data', async () => {
    const buf = Buffer.from('foobar', 'ascii');

    server.get('/buf', async (req, res) => {
      seen = true;
      return res.buffer(200, buf);
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/buf'
    }, [
      resHeaderDeepEqual('content-length', buf.length.toString()),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK'),
      resHeaderDeepEqual('content-type', 'application/octet-stream')
    ]);

    assert.bufferEqual(buf, res);
    assert.deepEqual(seen, true);
  });

  it('should return form data', async () => {
    const obj = {foo: 'bar'};
    const str = qs.stringify(obj) + '\n';

    server.get('/form', async (req, res) => {
      seen = true;
      return res.form(200, obj);
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/form'
    }, [
      resHeaderDeepEqual('content-length', str.length.toString()),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK'),
      resHeaderDeepEqual('content-type', 'application/x-www-form-urlencoded; charset=utf-8')
    ]);

    assert.deepEqual(str, res);
    assert.deepEqual(seen, true);
  });

  it('should return html data', async () => {
    const html = '<p>hello world</p>';

    server.get('/html', async (req, res) => {
      seen = true;
      return res.html(200, html);
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/html'
    }, [
      resHeaderDeepEqual('content-length', html.length.toString()),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK'),
      resHeaderDeepEqual('content-type', 'text/html; charset=utf-8')
    ]);

    assert.deepEqual(html, res);
    assert.deepEqual(seen, true);
  });

  it('should send a file', async () => {
    // Create file in temp directory
    // to send in the response.
    const file = path.join(os.tmpdir(), `bweb-${Date.now()}`);
    const data = Buffer.from('Hello Node.js');

    try {
      fs.writeFileSync(file, data);
    } catch (e) {
      assert.fail(e);
    }

    server.get('/file', async (req, res) => {
      seen = true;
      return res.sendFile(file);
    });

    const res = await client.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      path: '/file'
    }, [
      resHeaderDeepEqual('content-length', data.length.toString()),
      resHeaderDeepEqual('connection', 'close'),
      resDeepEqual('statusCode', 200),
      resDeepEqual('statusMessage', 'OK'),
      resHeaderDeepEqual('content-type', 'application/octet-stream')
    ]);

    assert.bufferEqual(res, data);

    fs.unlinkSync(file);
  });
});
