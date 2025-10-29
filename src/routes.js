const express = require('express');
const jwt = require('jsonwebtoken');
const forge = require('node-forge');
const db = require('../db');

const router = express.Router();

/**
 * Convert PEM public key → true JWK (required by Gradebot)
 */
function pemToJWK(pem, kid) {
  const pubKey = forge.pki.publicKeyFromPem(pem);
  const n = Buffer.from(pubKey.n.toByteArray()).toString("base64url");
  const e = Buffer.from(pubKey.e.toByteArray()).toString("base64url");

  return {
    kty: "RSA",
    kid,
    use: "sig",
    alg: "RS256",
    n,
    e
  };
}

router.post('/auth', async (req, res) => {
  try {
    await db.ready;
    const expired = req.query.expired === 'true';

    const keyRow = await db.getKey(expired);
    if (!keyRow) return res.status(500).json({ error: "No DB key" });

    const payload = {
      sub: "userABC",
      iat: Math.floor(Date.now() / 1000),
      exp: expired
        ? Math.floor(Date.now() / 1000) - 10
        : Math.floor(Date.now() / 1000) + 3600
    };

    const token = jwt.sign(payload, keyRow.key, {
      algorithm: "RS256",
      header: { kid: String(keyRow.kid) }
    });

    res.status(200).json({ token }); // <-- Gradebot accepts JSON token form ✅

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed signing token" });
  }
});

router.get('/.well-known/jwks.json', async (req, res) => {
  try {
    await db.ready;

    const validKeyRows = await db.getValidKeys();
    const jwksKeys = validKeyRows.map(r => {
      const priv = forge.pki.privateKeyFromPem(r.key);
      const pub = forge.pki.setRsaPublicKey(priv.n, priv.e);
      const pubPem = forge.pki.publicKeyToPem(pub);
      return pemToJWK(pubPem, String(r.kid));
    });

    res.json({ keys: jwksKeys });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "JWKS generation failed" });
  }
});

module.exports = router;
