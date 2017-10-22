/*!
 * mime.js - mime types for bweb
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('assert');

const types = {
  'json': ['application/json', true],
  'form': ['application/x-www-form-urlencoded', true],
  'html': ['text/html', true],
  'xhtml': ['application/xhtml+xml', true],
  'xml': ['application/xml', true],
  'js': ['application/javascript', true],
  'css': ['text/css', true],
  'txt': ['text/plain', true],
  'md': ['text/plain', true],
  'bin': ['application/octet-stream', false],
  'dat': ['application/octet-stream', false],
  'gif': ['image/gif', false],
  'jpg': ['image/jpeg', false],
  'png': ['image/png', false],
  'ico': ['image/x-icon', false],
  'svg': ['image/svg+xml', false],
  'pdf': ['application/pdf', false],
  'wav': ['audio/wav', false],
  'mp3': ['audio/mpeg', false],
  'ogg': ['audio/ogg', false],
  'mp4': ['video/mp4', false],
  'mkv': ['video/x-matroska', false],
  'webm': ['video/webm', false]
};

const extensions = {
  'text/x-json': 'json',
  'application/json': 'json',
  'application/x-www-form-urlencoded': 'form',
  'text/html': 'html',
  'application/xhtml+xml': 'xhtml',
  'text/javascript': 'js',
  'application/javascript': 'js',
  'text/css': 'css',
  'text/plain': 'txt',
  'application/octet-stream': 'bin',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/x-icon': 'ico',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/mpeg': 'mp3',
  'audio/mpa': 'mp3',
  'audio/ogg': 'ogg',
  'video/ogg': 'ogg',
  'video/mp4': 'mp4',
  'video/x-matroska': 'mkv',
  'audio/x-matroska': 'mkv',
  'audio/webm': 'webm',
  'video/webm': 'webm'
};

// Filename to extension
exports.file = function file(path) {
  assert(typeof path === 'string');

  const name = path.split('/').pop();
  const parts = name.split('.');

  if (parts.length < 2)
    return 'bin';

  if (parts.length === 2 && parts[0] === '')
    return 'txt';

  const ext = parts[parts.length - 1];

  if (types[ext])
    return ext;

  return 'bin';
};

// Is extension textual?
exports.textual = function textual(ext) {
  const value = types[ext];

  if (!value)
    return false;

  return value[1];
};

// Extension to content-type
exports.type = function type(ext) {
  assert(typeof ext === 'string');

  if (ext.indexOf('/') !== -1)
    return ext;

  const value = types[ext];

  if (!value)
    return 'application/octet-stream';

  let [name, text] = value;

  if (text)
    name += '; charset=utf-8';

  return name;
};

// Content-type to extension
exports.ext = function ext(type) {
  if (type == null)
    return 'bin';

  assert(typeof type === 'string');

  [type] = type.split(';');
  type = type.toLowerCase();
  type = type.trim();

  return extensions[type] || 'bin';
};
