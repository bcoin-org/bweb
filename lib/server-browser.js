/*!
 * server.js - http server for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const EventEmitter = require('events');
const Router = require('./router');
const RPC = require('./rpc');

/**
 * HTTP Server
 * @extends EventEmitter
 */

class Server extends EventEmitter {
  /**
   * Create an http server.
   * @constructor
   * @param {Object?} options
   */

  constructor(options) {
    super();
    this.options = options;
    this.config = {};
    this.server = new EventEmitter();
    this.io = new EventEmitter();
    this.rpc = new RPC();
    this.routes = new Router();
  }

  async open() {
    this.emit('listening', this.address());
  }

  async close() {}

  error() {}

  mount() {}

  use() {}

  hook(path, handler) {
    this.routes.hook(path, handler);
  }

  get(path, handler) {
    this.routes.get(path, handler);
  }

  post(path, handler) {
    this.routes.post(path, handler);
  }

  put(path, handler) {
    this.routes.put(path, handler);
  }

  del(path, handler) {
    this.routes.del(path, handler);
  }

  patch(path, handler) {
    this.routes.patch(path, handler);
  }

  channel() {
    return null;
  }

  join() {}

  leave() {}

  to() {}

  all() {}

  async execute() {}

  add() {}

  address() {
    return { address: 'localhost', port: 80 };
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

  fileServer() {
    return async () => {};
  }

  cookieParser() {
    return async () => {};
  }
}

/*
 * Expose
 */

module.exports = Server;
