/*!
 * test/route-test.js - Route tests for bweb
 * Copyright (c) 2019, Mark Tyneway (MIT License).
 * https://github.com/bcoin-org/bweb
 */

'use strict';

const assert = require('bsert');
const Route = require('../lib/route');

describe('Route', function() {
  it('should fail without a path argument', () => {
    assert.throws(() => new Route());
  });

  it('should fail without a handler', () => {
    assert.throws(() => new Route('/'));
  });

  it('should fail without a handler of arity 2 or 3', () => {
    // Assert that handlers with function signatures that
    // have 0, 1, 4 and 5 arguments fail while handlers with
    // function signatures that have 2 or 3 arguments pass.
    assert.throws(() => new Route('/', () => {}));
    assert.throws(() => new Route('/', (a) => {}));
    assert.ok(new Route('/', (a, b) => {}));
    assert.ok(new Route('/', (a, b, c) => {}));
    assert.throws(() => new Route('/', (a, b, c, d) => {}));
    assert.throws(() => new Route('/', (a, b, c, d, e) => {}));
  });

  describe('Route.match', function() {
    // path, target, expected
    const mocks = [
      // Matches with no route paths.
      ['/path', '/path', {}],
      // Matches with one route path.
      ['/path/foo', '/path/:zero', {
        '0': 'foo',
        zero: 'foo'
      }],
      // Matches with two route paths.
      ['/path/foo/bar', '/path/:zero/:one', {
        '0': 'foo',
        '1': 'bar',
        zero: 'foo',
        one: 'bar'
      }],
      // Does not match.
      ['/path', '/no', null],
      // Longer path does not match suffix.
      ['/path/foo', '/path', null]
    ];

    for (const [path, target, expected] of mocks) {
      it(`${path} should ${expected ? '': 'not '}match ${target}`, () => {
        const route = new Route(target, noop);
        const match = route.match(path);

        if (expected !== null)
          assert.deepEqual(expected, Object.assign({}, match));
        else
          assert.deepEqual(match, null);
      });
    }
  });
});

function noop(req, res) {}
