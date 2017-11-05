const { performance } = require('perf_hooks');
const sha256 = require('./js-sha256');
const buffer100b = new Uint8Array(100);
const buffer1k = new Uint8Array(1024);
const buffer1m = new Uint8Array(1024 * 1024);

function test_crypto(buffer) {
  return sha256(buffer);
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

const message = `
purejs, sha256, 100b => ${t1} ms
purejs, sha256, 1kb => ${t2} ms
purejs, sha256, 1mb => ${t3} ms
`;

console.log(message);