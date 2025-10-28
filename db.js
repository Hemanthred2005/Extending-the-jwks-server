const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./totally_not_my_privateKeys.db', (err) => {
    if (err) console.error("DB Error:", err);
    else console.log("✅ Connected to SQLite DB");
});

db.run(`
CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    private_key TEXT NOT NULL,
    expired_at DATETIME
)`, (err) => {
    if (err) console.error("❌ Table creation failed:", err);
});

// ✅ INSERT a key into DB
db.insertKey = (kid, privateKey, expires) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO keys (id, private_key, expired_at) VALUES (?, ?, ?)`,
            [kid, privateKey, new Date(expires * 1000)],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

// ✅ GET ALL KEYS
db.getAllKeys = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM keys`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// ✅ GET KEY BY ID
db.getKeyById = (kid) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM keys WHERE id = ?`, [kid], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

module.exports = db;
