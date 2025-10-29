const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'totally_not_my_privateKeys.db');
const db = new sqlite3.Database(DB_PATH);

const ready = new Promise((resolve, reject) => {
  db.run(
    `CREATE TABLE IF NOT EXISTS keys(
       kid INTEGER PRIMARY KEY AUTOINCREMENT,
       key BLOB NOT NULL,
       exp INTEGER NOT NULL
     )`,
    err => err ? reject(err) : resolve()
  );
});

// INSERT private key
function insertKey(pemPrivateKey, expEpochSeconds) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO keys (key, exp) VALUES (?, ?)`,
      [pemPrivateKey, expEpochSeconds],
      function(err) { err ? reject(err) : resolve(this.lastID); }
    );
  });
}

// Fetch ONE key depending on expired flag
function getKey(expired) {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);

    const sql = expired
      ? `SELECT kid, key, exp FROM keys WHERE exp <= ? ORDER BY exp DESC LIMIT 1`
      : `SELECT kid, key, exp FROM keys WHERE exp >  ? ORDER BY exp ASC  LIMIT 1`;

    db.get(sql, [now], (err, row) =>
      err ? reject(err) : resolve(row || null)
    );
  });
}

// Fetch ONLY unexpired keys for JWKS
function getValidKeys() {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    db.all(
      `SELECT kid, key, exp FROM keys WHERE exp > ? ORDER BY exp ASC`,
      [now],
      (err, rows) => err ? reject(err) : resolve(rows || [])
    );
  });
}

module.exports = {
  db,
  ready,
  insertKey,
  getKey,
  getValidKeys,
  DB_PATH
};
