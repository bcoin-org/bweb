/*!
 * response.js - response object for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const qs = require('querystring');
const mime = require('./mime');

class Response extends EventEmitter {
  /**
   * Response
   * @constructor
   * @ignore
   */

  constructor(req, res) {
    super();

    this.req = req;
    this.res = res;
    this.sent = false;
    this.readable = false;
    this.writable = true;
    this.statusCode = 200;
    this.res.statusCode = 200;

    if (req)
      this.init(req, res);
  }

  init(req, res) {
    assert(req);
    assert(res);

    res.on('error', (err) => {
      this.emit('error', err);
    });

    res.on('drain', () => {
      this.emit('drain');
    });

    res.on('close', () => {
      this.emit('close');
    });
  }

  setStatus(code) {
    assert(typeof code === 'number', 'Code must be a number.');
    this.statusCode = code;
    this.res.statusCode = code;
  }

  setType(type) {
    this.setHeader('Content-Type', mime.type(type));
  }

  setLength(length) {
    assert(typeof length === 'number');
    this.setHeader('Content-Length', length.toString(10));
  }

  destroy() {
    return this.res.destroy();
  }

  setHeader(key, value) {
    return this.res.setHeader(key, value);
  }

  getHeader(key) {
    return this.res.getHeader(key);
  }

  read(stream) {
    assert(!this.sent, 'Request already sent.');
    this.sent = true;
    stream.pipe(this.res);
  }

  write(data, enc) {
    assert(!this.sent, 'Request already sent.');
    return this.res.write(data, enc);
  }

  end(data, enc) {
    assert(!this.sent, 'Request already sent.');
    this.sent = true;
    return this.res.end(data, enc);
  }

  redirect(code, url) {
    if (!url) {
      url = code;
      code = 301;
    }

    this.setStatus(code);
    this.setHeader('Location', url);
    this.end();
  }

  text(code, msg) {
    if (msg == null)
      return this.send(code, null, 'txt');
    assert(typeof msg === 'string');
    return this.send(code, msg, 'txt');
  }

  buffer(code, msg) {
    if (msg == null)
      return this.send(code, null, 'bin');
    assert(Buffer.isBuffer(msg));
    return this.send(code, msg, 'bin');
  }

  json(code, json) {
    if (json == null)
      return this.send(code, null, 'json');
    assert(json && typeof json === 'object');
    const msg = JSON.stringify(json, null, 2) + '\n';
    return this.send(code, msg, 'json');
  }

  form(code, data) {
    if (data == null)
      return this.send(code, null, 'form');
    assert(data && typeof data === 'object');
    const msg = qs.stringify(data) + '\n';
    return this.send(code, msg, 'form');
  }

  html(code, msg) {
    if (msg == null)
      return this.send(code, null, 'html');
    assert(typeof msg === 'string');
    return this.send(code, msg, 'html');
  }

  send(code, msg, type) {
    this.setStatus(code);

    if (type)
      this.setType(type);

    if (msg == null) {
      this.setLength(0);
      try {
        this.end();
      } catch (e) {
        ;
      }
      return;
    }

    if (typeof msg === 'string') {
      const len = Buffer.byteLength(msg, 'utf8');

      this.setLength(len);

      try {
        this.write(msg, 'utf8');
        this.end();
      } catch (e) {
        ;
      }

      return;
    }

    assert(Buffer.isBuffer(msg));

    this.setLength(msg.length);

    try {
      this.write(msg);
      this.end();
    } catch (e) {
      ;
    }
  }
}

module.exports = Response;
