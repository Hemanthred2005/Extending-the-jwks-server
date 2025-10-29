const { ready, insertKey, getKey } = require('../db');
const forge = require('node-forge');

async function seed() {
  await ready;

  const pair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

  const privatePem = forge.pki.privateKeyToPem(pair.privateKey);
  const now = Math.floor(Date.now() / 1000);

  await insertKey(privatePem, now + 3600);  // valid key
  await insertKey(privatePem, now - 10);    // expired key

  console.log("✅ DB seeded: valid + expired");
}

module.exports = { seed };
