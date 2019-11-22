/*!
 * test/util-test.js - Utility tests for bweb
 * Copyright (c) 2019, Mark Tyneway (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('bsert');

const {
  parseURL,
  parseForm,
  unescape,
  isAscii
} = require('../lib/util');

describe('Utils', function() {
  describe('parseURL', () => {
    it('should parse url', () => {
      const url = parseURL('/');
      assert.deepEqual(url.url, '/');
      assert.deepEqual(url.pathname, '/');
    });

    it('should parse trailing slash', () => {
      const url = parseURL('/foo/');
      assert.deepEqual(url.trailing, true);
    });

    it('should add a prefix slash', () => {
      const url = parseURL('foo/');
      assert.deepEqual(url.url, '/foo');
    });
  });

  describe('parseForm', () => {
    it('should parse a querystring', () => {
      const form = parseForm('a=b', 1);

      const expect = Object.create(null);
      expect.a = 'b';

      assert.deepEqual(form, expect);
    });

    it('should parse empty querystring', () => {
      const form = parseForm('', 1);
      assert(form);
    });

    it('should fail when too', () => {
      assert.throws(() => parseForm('a=b', 0), 'Too many keys in querystring.');
    });
  });

  describe('unescape', () => {
    it('should escape', () => {
      const escaped = unescape('%3Fx%3Dtest');
      assert.deepEqual(escaped, '?x=test');
    });
  });

  describe('isAscii', () => {
    it('should detect ascii', () => {
      assert(isAscii('foobar'));
    });

    it('should detect non ascii', () => {
      assert(!isAscii('f��bar'));
    });
  });
});
