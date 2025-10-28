const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');
const { createKey } = require('./util');
const base64url = require('base64url');

function getJWKS(callback) {
    db.all("SELECT id, private_key, expired_at FROM keys", (err, rows) => {
        if (err) return callback(err);

        const keys = rows.map(row => {
            const kid = row.id.toString();
            return {
                kid,
                kty: "RSA",
                alg: "RS256",
                use: "sig",
                kid_valid: !isExpired(row.expired_at)
            };
        });

        callback(null, keys);
    });
}

function isExpired(date) {
    return new Date(date) < new Date();
}

function nEfromPrivate(privateKeyPEM) {
    const key = privateKeyPEM;
    const crypto = require('crypto');
    const privateKey = crypto.createPrivateKey(key);
    const publicKey = crypto.createPublicKey(privateKey);

    const keyObj = publicKey.export({ format: 'jwk' });
    return { n: keyObj.n, e: keyObj.e };
}

router.get('/auth', (req, res) => {
    const wantExpired = req.query.expired === 'true';

    db.all("SELECT * FROM keys", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        let row = rows.find(r => isExpired(r.expired_at) === wantExpired);

        if (!row) {
            const { privateKey, expires } = createKey(wantExpired);
            db.run(`INSERT INTO keys (private_key, expired_at) VALUES (?, ?)`,
                [privateKey, expires], function () {
                    row = { id: this.lastID, private_key: privateKey, expired_at: expires };
                    return sendJWT(res, row);
                });
        } else {
            return sendJWT(res, row);
        }
    });
});

function sendJWT(res, row) {
    const expires = row.expired_at;
    const payload = {
        sub: row.id,
        exp: Math.floor(new Date(expires).getTime() / 1000)
    };

    const token = jwt.sign(payload, row.private_key, { algorithm: 'RS256' });
    res.json({ token });
}

router.get('/.well-known/jwks.json', (req, res) => {
    db.all("SELECT * FROM keys", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const jwks = {
            keys: rows.map(row => {
                const kid = row.id.toString();
                const { n, e } = nEfromPrivate(row.private_key);
                return {
                    kid,
                    kty: "RSA",
                    alg: "RS256",
                    use: "sig",
                    n,
                    e,
                };
            })
        };

        res.json(jwks);
    });
});

module.exports = router;
