const crypto = require('crypto');
const { performance } = require('perf_hooks');
const buffer100b = Buffer.alloc(100);
const buffer1k = Buffer.alloc(1024);
const buffer1m = Buffer.alloc(1024 * 1024);

function test_crypto(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

function test(fn, buf, times) {
  let time = 0;

  for (let i = 0; i < times; ++i) {
    const start = performance.now();

    fn(buf);
    time += performance.now() - start;
  }

  return time;
}

const t1 = test(test_crypto, buffer100b, 1e4);
const t2 = test(test_crypto, buffer1k, 1e4);
const t3 = test(test_crypto, buffer1m, 1e3);

console.log('web crypto, sha256, 100b => %s ms', t1);
console.log('web crypto, sha256, 1kb  => %s ms', t2);
console.log('web crypto, sha256, 1mb, => %s ms', t3);
