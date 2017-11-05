const fs = require('fs');
const { performance } = require('perf_hooks');

const buffer100b = Buffer.alloc(100);
const buffer1k = Buffer.alloc(1024);
const buffer1m = Buffer.alloc(1024 * 1024);

const wasmBinary = fs.readFileSync('./libnettle.wasm');
const emscripten = require('./libnettle.node');

const Module = emscripten({
  wasmBinary,
});

const SHA256_DIGEST_SIZE = 32;

function test_crypto(buffer) {
  const sha256_ptr = Module._create_sha256();

  const input_ptr = Module._malloc(buffer.length);
  Module.HEAPU8.set(buffer, input_ptr);

  Module._nettle_sha256_update(sha256_ptr, buffer.length, input_ptr);
  Module._free(input_ptr);

  const output_ptr = Module._malloc(SHA256_DIGEST_SIZE);

  Module._nettle_sha256_digest(sha256_ptr, SHA256_DIGEST_SIZE, output_ptr);
  const result = Buffer.from(
    Module.HEAPU8.slice(output_ptr, output_ptr + SHA256_DIGEST_SIZE)
  );

  Module._free(output_ptr);
  Module._free(sha256_ptr);

  return result;
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

console.log('wasm, sha256, 100b => %s ms', t1);
console.log('wasm, sha256, 1kb  => %s ms', t2);
console.log('wasm, sha256, 1mb, => %s ms', t3);
