const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'keys.db');
const db = new sqlite3.Database(dbPath);

function init() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid TEXT UNIQUE,
        private_key TEXT,
        public_key TEXT,
        expired BOOLEAN DEFAULT 0
      );
    `, (err) => {
      if (err) {
        console.error("❌ Error creating table:", err);
        reject(err);
      } else {
        console.log("✅ Table ready");
        resolve();
      }
    });
  });
}

module.exports = {
  ready: init(), // <-- ensures table is created before queries

  insertKey(kid, privateKey, publicKey, expired = false) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO keys (kid, private_key, public_key, expired)
         VALUES (?, ?, ?, ?)`,
        [kid, privateKey, publicKey, expired ? 1 : 0],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },
  
  

  getKey(expired) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM keys WHERE expired = ? LIMIT 1",
        [expired ? 1 : 0],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });
  },

  getPublicKeys() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT kid, public_key AS x5c FROM keys WHERE expired = 0",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(r => ({
            kty: "RSA",
            kid: r.kid,
            alg: "RS256",
            use: "sig",
            x5c: [r.x5c]
          })));
        }
      );
    });
  }
};
