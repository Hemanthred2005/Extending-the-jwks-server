const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

router.post('/auth', async (req, res) => {
  try {
    await db.ready; // ✅ Wait for DB setup
    const expired = req.query.expired === 'true';
    
    // ✅ Get key based on expired flag
    const key = await db.getKey(expired);
    if (!key) return res.status(500).json({ error: "No key available" });

    // ✅ Decode username from Basic Auth header
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization" });

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username] = credentials.split(':');

    const payload = {
      sub: username,
      exp: expired
        ? Math.floor(Date.now() / 1000) - 10  // expired already ❌
        : Math.floor(Date.now() / 1000) + 3600 // valid ✅
    };

    const token = jwt.sign(payload, key.private_key, {
      algorithm: "RS256",
      keyid: key.kid
    });

    return res.status(200).json({ token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error generating token" });
  }
});

router.get('/.well-known/jwks.json', async (req, res) => {
  await db.ready;
  const keys = await db.getPublicKeys();
  res.json({ keys });
});

module.exports = router;
