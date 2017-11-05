const buffer100b = new ArrayBuffer(100);
const buffer1k = new ArrayBuffer(1024);
const buffer1m = new ArrayBuffer(1024 * 1024);

function test_crypto(buffer) {
  return crypto.subtle.digest({ name: 'SHA-256' }, buffer);
}

async function test(fn, buf, times) {
  let time = 0;

  for (let i = 0; i < times; ++i) {
    const start = performance.now();

    await fn(buf);
    time += performance.now() - start;
  }

  return time;
}

(async () => {
  const t1 = await test(test_crypto, buffer100b, 1e4);
  const t2 = await test(test_crypto, buffer1k, 1e4);
  const t3 = await test(test_crypto, buffer1m, 1e3);

  const message = `
  web crypto, sha256, 100b => ${t1} ms
  web crypto, sha256, 1kb => ${t2} ms
  web crypto, sha256, 1mb => ${t3} ms
  `;

  alert(message);
  console.log(message);
})();
