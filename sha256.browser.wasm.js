/* global emscripten */
const buffer100b = new Uint8Array(100);
const buffer1k = new Uint8Array(1024);
const buffer1m = new Uint8Array(1024 * 1024);

const Module = emscripten({
  locateFile,
  onRuntimeInitialized,
});

function locateFile() {
  return 'libnettle.wasm';
}

const SHA256_DIGEST_SIZE = 32;

function test_crypto(buffer) {
  const sha256_ptr = Module._create_sha256();

  const input_ptr = Module._malloc(buffer.length);
  Module.HEAPU8.set(buffer, input_ptr);

  Module._nettle_sha256_update(sha256_ptr, buffer.length, input_ptr);
  Module._free(input_ptr);

  const output_ptr = Module._malloc(SHA256_DIGEST_SIZE);

  Module._nettle_sha256_digest(sha256_ptr, SHA256_DIGEST_SIZE, output_ptr);
  const result = Module.HEAPU8.slice(
    output_ptr,
    output_ptr + SHA256_DIGEST_SIZE
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

function onRuntimeInitialized() {
  const t1 = test(test_crypto, buffer100b, 1e4);
  const t2 = test(test_crypto, buffer1k, 1e4);
  const t3 = test(test_crypto, buffer1m, 1e3);

  const message = `
  wasm, sha256, 100b => ${t1} ms
  wasm, sha256, 1kb => ${t2} ms
  wasm, sha256, 1mb => ${t3} ms
  `;

  alert(message);
  console.log(message);
}
