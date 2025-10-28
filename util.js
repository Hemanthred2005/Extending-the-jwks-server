const { generateKeyPairSync } = require('crypto');

function createKey(expired = false) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    let expires = expired
        ? new Date(Date.now() - 3600000)       // expired 1 hour ago
        : new Date(Date.now() + 3600000);      // expires in 1 hour

    return { privateKey, publicKey, expires };
}

module.exports = { createKey };
