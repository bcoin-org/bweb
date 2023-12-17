/*!
 * util.js - utils server for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('bsert');

/*
 * Util
 */

function parseURL(uri) {
  assert(typeof uri === 'string');

  if (uri.length > 4096)
    throw new Error('URI is too long.');

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const start = uri[4] === ':' ? 7 : 8;
    const index = uri.indexOf('/', start);

    if (index >= 0)
      uri = uri.substring(index);
    else
      uri = '/';
  }

  {
    const index = uri.indexOf('#');

    if (index >= 0)
      uri = uri.substring(0, index);
  }

  let pathname = '';
  let search = '';

  {
    const index = uri.indexOf('?');

    if (index >= 0) {
      search = uri.substring(index);
      pathname = uri.substring(0, index);
    } else {
      pathname = uri;
    }
  }

  let trailing = false;
  let pathorig = '/';

  if (pathname) {
    if (pathname.length > 1024)
      throw new Error('Pathname is too long.');

    // Remove double slashes.
    pathname = pathname.replace(/\/{2,}/g, '/');

    // Ensure leading slash.
    if (pathname[0] !== '/')
      pathname = '/' + pathname;

    // Remove trailing slash.
    if (pathname.length > 1) {
      if (pathname[pathname.length - 1] === '/') {
        pathname = pathname.slice(0, -1);
        trailing = true;
      }
    }

    if (/%2f/i.test(pathname))
      throw new Error('Percent-encoded slashes in path.');

    // Unescape.
    pathorig = pathname;
    pathname = decodeURIComponent(pathname);
  } else {
    // Ensure leading slash.
    pathname = '/';
  }

  if (hasInvalidCharacters(pathname))
    throw new Error('Invalid characters in path.');

  // Sanity checks.
  assert(pathname.length > 0);
  assert(pathname[0] === '/');
  assert(pathname === '/' || pathname[pathname.length - 1] !== '/');

  // Create path array.
  let path = [];

  if (pathname !== '/')
    path = pathname.substring(1).split('/');

  for (const part of path) {
    if (part === '.' || part === '..')
      throw new Error('Path resolution disallowed.');
  }

  // URL = Pathname + QS.
  let url = pathorig;

  if (search.length > 1) {
    assert(search[0] === '?');
    url += search;
  }

  // Pre-parsed querystring.
  let query = Object.create(null);

  if (search.length > 1)
    query = parseForm(search.substring(1), 100);

  return {
    url,
    pathname,
    path,
    query,
    trailing
  };
}

function hasInvalidCharacters(pathname) {
  for (let i = 0; i < pathname.length; i++) {
    const ch = pathname.charCodeAt(i);

    // Range from ` ` to `~`. Disallow `\`.
    if (ch < 32 || ch > 126 || ch === 92)
      return true;
  }

  return false;
}

function parseForm(str, limit) {
  assert((limit >>> 0) === limit);

  const parts = str.split('&', limit + 1);
  const data = Object.create(null);

  if (parts.length > limit)
    throw new Error('Too many keys in querystring.');

  for (const pair of parts) {
    const index = pair.indexOf('=');

    let key, value;

    if (index >= 0) {
      key = pair.substring(0, index);
      value = pair.substring(index + 1);
    } else {
      key = pair;
      value = '';
    }

    key = unescape(key);

    if (key.length === 0)
      continue;

    data[key] = unescape(value);
  }

  return data;
}

function unescape(str) {
  str = str.replace(/\+/g, ' ');
  str = decodeURIComponent(str);

  if (str.includes('\0'))
    throw new Error('Percent-encoded NUL disallowed.');

  return str;
}

function isAscii(str) {
  return typeof str === 'string' && /^[\t\n\r -~]*$/.test(str);
}

function call(fn, ...args) {
  return new Promise((resolve, reject) => {
    const cb = (err, result) => {
      if (err) {
        reject(extendError(err));
        return;
      }
      resolve(result);
    };

    try {
      fn(...args, cb);
    } catch (e) {
      reject(e);
    }
  });
}

function extendError(err) {
  switch (err.code) {
    case 'EACCES':
    case 'EPERM': {
      err.statusCode = 403;
      break;
    }
    case 'ENOENT':
    case 'ENAMETOOLONG':
    case 'ENOTDIR':
    case 'EISDIR': {
      err.statusCode = 404;
      break;
    }
    default: {
      err.statusCode = 500;
      break;
    }
  }
  return err;
}

/*
 * Expose
 */

exports.parseURL = parseURL;
exports.parseForm = parseForm;
exports.unescape = unescape;
exports.isAscii = isAscii;
exports.call = call;
exports.extendError = extendError;
