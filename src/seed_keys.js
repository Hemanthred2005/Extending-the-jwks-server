const db = require('../db');
const fs = require('fs');
const path = require('path');

async function seed() {
  await db.ready; // ✅ Wait for table creation

  console.log("✅ Table is ready, inserting keys...");

  const privateKeyPath = path.join(__dirname, '../keys/private_key.pem');
  const publicKeyPath = path.join(__dirname, '../keys/public_key.pem');

  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

  // Insert valid key
  await db.insertKey('kid_valid', privateKey, publicKey, false);

  // Insert expired key
  await db.insertKey('kid_expired', privateKey, publicKey, true);

  console.log("✅ Keys seeded successfully!");
}

seed().catch(err => console.error(err));
