const { generateKeyPairSync } = require('crypto');
const db = require('./db');

function seed() {
  // Generate RSA private key (PEM format)
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const now = Math.floor(Date.now() / 1000);

  // Insert an unexpired key
  db.insertKey("kid_valid", privateKey, now + 3600);

  // Insert an expired key
  db.insertKey("kid_expired", privateKey, now - 3600);

  console.log("✅ Keys seeded successfully!");
}

seed();
