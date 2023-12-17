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

const O = data => Object.assign(Object.create(null), data);

describe('Utils', function() {
  describe('parseURL', () => {
    it('should parse url', () => {
      const url = parseURL('/');
      assert.strictEqual(url.url, '/');
      assert.strictEqual(url.pathname, '/');
    });

    it('should parse empty url', () => {
      const url = parseURL('');
      assert.strictEqual(url.url, '/');
      assert.strictEqual(url.pathname, '/');
    });

    it('should parse trailing slash', () => {
      const url = parseURL('/foo/');
      assert.strictEqual(url.trailing, true);
    });

    it('should add a prefix slash', () => {
      assert.strictEqual(parseURL('foo/').pathname, '/foo');
      assert.strictEqual(parseURL('foo').pathname, '/foo');
    });

    it('should collapse slashes', () => {
      assert.strictEqual(parseURL('foo//bar').pathname, '/foo/bar');
      assert.strictEqual(parseURL('//foo//bar//').pathname, '/foo/bar');
    });

    it('should throw on invalid paths', () => {
      assert.throws(() => parseURL('/foo/.'));
      assert.throws(() => parseURL('/foo/./'));
      assert.throws(() => parseURL('/foo/./bar'));
      assert.throws(() => parseURL('/foo/..'));
      assert.throws(() => parseURL('/foo/../'));
      assert.throws(() => parseURL('/foo/../bar'));
      assert.throws(() => parseURL('/foo/b%2far'));
      assert.throws(() => parseURL('/foo/b%01ar'));
      assert.throws(() => parseURL('/foo\\bar'));
    });

    it('should parse components', () => {
      assert.deepStrictEqual(parseURL('https://x:8080'), {
        url: '/',
        pathname: '/',
        path: [],
        query: O({}),
        trailing: false
      });

      assert.deepStrictEqual(parseURL('https://x:8080/foo/bar?baz=1'), {
        url: '/foo/bar?baz=1',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({ baz: '1' }),
        trailing: false
      });

      assert.deepStrictEqual(parseURL('http://x:8080/foo/bar?baz=1'), {
        url: '/foo/bar?baz=1',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({ baz: '1' }),
        trailing: false
      });

      assert.deepStrictEqual(parseURL('http://x:8080//foo//bar?baz=1'), {
        url: '/foo/bar?baz=1',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({ baz: '1' }),
        trailing: false
      });

      assert.deepStrictEqual(parseURL('/foo/bar//?baz=1'), {
        url: '/foo/bar?baz=1',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({ baz: '1' }),
        trailing: true
      });

      assert.deepStrictEqual(parseURL('/foo//bar?baz=%21'), {
        url: '/foo/bar?baz=%21',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({ baz: '!' }),
        trailing: false
      });

      assert.deepStrictEqual(parseURL('/foo//bar/#foobar'), {
        url: '/foo/bar',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({}),
        trailing: true
      });

      assert.deepStrictEqual(parseURL('/foo//bar?baz=1#foobar'), {
        url: '/foo/bar?baz=1',
        pathname: '/foo/bar',
        path: ['foo', 'bar'],
        query: O({ baz: '1' }),
        trailing: false
      });

      assert.deepStrictEqual(parseURL('/foo%201//bar+2/?baz=1#foobar'), {
        url: '/foo%201/bar+2?baz=1',
        pathname: '/foo 1/bar+2',
        path: ['foo 1', 'bar+2'],
        query: O({ baz: '1' }),
        trailing: true
      });
    });
  });

  describe('parseForm', () => {
    it('should parse a querystring', () => {
      const form = parseForm('a=1%202&b=3+4&c', 3);

      assert.deepStrictEqual(form, O({
        a: '1 2',
        b: '3 4',
        c: ''
      }));
    });

    it('should parse empty querystring', () => {
      const form = parseForm('', 1);
      assert.deepStrictEqual(form, O({}));
    });

    it('should fail on too many keys', () => {
      assert.throws(() => parseForm('a=1&b=2', 1), {
        message: 'Too many keys in querystring.'
      });
    });

    it('should fail on NUL byte', () => {
      assert.throws(() => parseForm('a=1&b=%00', 1));
    });
  });

  describe('unescape', () => {
    it('should escape', () => {
      const escaped = unescape('%3Fx%3Dtest');
      assert.strictEqual(escaped, '?x=test');
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
