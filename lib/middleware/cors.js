/*!
 * cors.js - cors middleware for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('bsert');

/**
 * CORS middleware.
 * @returns {Function}
 */

function cors(options = {}) {
  assert(options && typeof options === 'object');
  assert(options.origins == null || Array.isArray(options.origins));

  const origins = options.origins || [];

  for (const origin of origins) {
    assert(typeof origin === 'string' && origin.length > 0);
    assert(origin !== '*' && origin !== 'null');
  }

  return async (req, res) => {
    const origin = req.headers.origin || '';

    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Headers',
                    'Authorization,Content-Type,User-Agent');
      res.setHeader('Access-Control-Allow-Methods',
                    'GET,HEAD,PUT,PATCH,POST,DELETE');
    }

    if (origins.length === 0)
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    else if (origins.length === 1)
      res.setHeader('Access-Control-Allow-Origin', origins[0]);
    else if (origins.includes(origin))
      res.setHeader('Access-Control-Allow-Origin', origin);

    if (req.method === 'OPTIONS') {
      res.setHeader('Content-Length', '0');
      res.setStatus(204);
      res.end();
      return;
    }
  };
}

/*
 * Expose
 */

module.exports = cors;
