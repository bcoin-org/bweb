/*!
 * basicauth.js - basic auth for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const {isAscii} = require('../util');

/**
 * Basic auth middleware.
 * @param {Object} options
 * @returns {Function}
 */

function basicAuth(options) {
  assert(options, 'Basic auth requires options.');

  let user = options.username;
  let pass = options.password;
  let realm = options.realm;

  if (user != null) {
    assert(typeof user === 'string');
    assert(user.length <= 255, 'Username too long.');
    assert(isAscii(user), 'Username must be ASCII.');
    user = sha256(user, 'ascii');
  }

  assert(typeof pass === 'string');
  assert(pass.length <= 255, 'Password too long.');
  assert(isAscii(pass), 'Password must be ASCII.');
  pass = sha256(pass, 'ascii');

  if (!realm)
    realm = 'server';

  assert(typeof realm === 'string');

  const fail = (res) => {
    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
    res.setStatus(401);
    res.end();
  };

  return async (req, res) => {
    const hdr = req.headers['authorization'];

    if (!hdr) {
      fail(res);
      return;
    }

    if (hdr.length > 674) {
      fail(res);
      return;
    }

    const parts = hdr.split(' ');

    if (parts.length !== 2) {
      fail(res);
      return;
    }

    const [type, b64] = parts;

    if (type !== 'Basic') {
      fail(res);
      return;
    }

    const auth = Buffer.from(b64, 'base64').toString('ascii');
    const items = auth.split(':');

    const username = items.shift();
    const password = items.join(':');

    if (user) {
      if (username.length > 255) {
        fail(res);
        return;
      }

      const hash = sha256(username, 'ascii');

      if (!ccmp(hash, user)) {
        fail(res);
        return;
      }
    }

    if (password.length > 255) {
      fail(res);
      return;
    }

    const hash = sha256(password, 'ascii');

    if (!ccmp(hash, pass)) {
      fail(res);
      return;
    }

    req.username = username;
  };
};

/*
 * Helpers
 */

function sha256(data, enc) {
  return crypto.createHash('sha256').update(data, enc).digest();
}

function ccmp(a, b) {
  return crypto.timingSafeEqual(a, b);
}

/*
 * Expose
 */

module.exports = basicAuth;
