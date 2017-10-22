/*!
 * server.js - http server for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const EventEmitter = require('events');
const RPC = require('./rpc');

class Server extends EventEmitter {
  constructor() {
    super();
    this.config = {};
    this.server = new EventEmitter();
    this.io = new EventEmitter();
    this.rpc = new RPC();
  }

  async open() {}

  async close() {}

  error() {}

  mount() {}

  use() {}

  hook() {}

  get() {}

  post() {}

  put() {}

  del() {}

  join() {}

  leave() {}

  to() {}

  all() {}

  async execute() {}

  add() {}

  address() {
    return {};
  }

  router() {
    return async () => {};
  }

  cors() {
    return async () => {};
  }

  basicAuth() {
    return async () => {};
  }

  bodyParser() {
    return async () => {};
  }

  jsonRPC() {
    return async () => {};
  }

  file() {
    return async () => {};
  }
}

/*
 * Expose
 */

module.exports = Server;
