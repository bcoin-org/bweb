/**
 *
 */

'use strict';

const assert = require('bsert');
const Router = require('../lib/router');
const Route = require('../lib/route');
const Hook = require('../lib/hook');

// noop handler function with arity 2
function handle(a, b) {};

describe('Router', function() {
  let router;
  beforeEach(() => {
    router = new Router();
  });

  afterEach(() => {
    router = null;
  });

  it('should add GET Route', () => {
    router.get('/get', handle);

    assert.equal(router._get.length, 1);
    assert.deepEqual(router._get[0], new Route('/get', handle));
  });

  it('should add POST Route', () => {
    router.post('/post', handle);

    assert.equal(router._post.length, 1);
    assert.deepEqual(router._post[0], new Route('/post', handle));
  });

  it('should add PUT Route', () => {
    router.put('/put', handle);

    assert.equal(router._put.length, 1);
    assert.deepEqual(router._put[0], new Route('/put', handle));
  });

  it('should add DELETE Route', () => {
    router.del('/delete', handle);

    assert.equal(router._del.length, 1);
    assert.deepEqual(router._del[0], new Route('/delete', handle));
  });

  it('should add PATCH Route', () => {
    router.patch('/patch', handle);

    assert.equal(router._patch.length, 1);
    assert.deepEqual(router._patch[0], new Route('/patch', handle));
  });

  it('should add hook', () => {
    router.hook('/', handle);

    assert.equal(router.hooks.length, 1);
    assert.deepEqual(router.hooks[0], new Hook('/', handle));
  });
});
