const assert = require('assert');
const OSS = require('../../..');
const config = require('../../config').oss;
const mm = require('mm');

describe('test/retry.test.js', () => {
  let store;
  it('set retryMax to test request auto retry when networkError or timeout', async () => {
    const RETRY_MAX = 3;
    // set retryMax to test request auto retry when networkError or timeout
    let testRetryCount = 0;
    config.retryMax = RETRY_MAX;
    config.requestErrorRetryHandle = () => {
      testRetryCount++;
      if (testRetryCount === RETRY_MAX) {
        mm.restore();
      }
      return true;
    };
    store = new OSS(config);
    mm.error(store.urllib, 'request', {
      status: -1, // timeout
      headers: {}
    });
    const res = await store.listBuckets();
    assert.strictEqual(res.res.status, 200);

    assert.strictEqual(testRetryCount, testRetryCount);
  });

  it('should throw when retry count bigger than options retryMax', async () => {
    const RETRY_MAX = 3;
    // set retryMax to test request auto retry when networkError or timeout
    config.retryMax = RETRY_MAX;
    store = new OSS(config);
    mm.error(store.urllib, 'request', {
      status: -1, // timeout
      headers: {}
    });
    try {
      await store.listBuckets();
      assert(false);
    } catch (error) {
      assert(error.status === -1);
    }
    mm.restore();
  });
});
