const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = require('../src/server'); 

const dbPath = path.join(__dirname, '../totally_not_my_privateKeys.db');

describe('JWKS Server Tests', () => {

  test('/auth returns a valid JWT', async () => {
    const res = await request(app)
      .post('/auth')
      .auth('userABC', 'password123');

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const decoded = jwt.decode(res.body.token, { complete: true });
    expect(decoded.header).toHaveProperty('kid');
    expect(decoded.payload).toHaveProperty('exp');
  });

  test('/auth?expired=true returns an expired JWT', async () => {
    const res = await request(app)
      .post('/auth?expired=true')
      .auth('userABC', 'password123');

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const decoded = jwt.decode(res.body.token);
    expect(decoded.exp < Math.floor(Date.now() / 1000)).toBe(true);
  });

  test('/.well-known/jwks.json exposes valid JWK keys', async () => {
    const res = await request(app).get('/.well-known/jwks.json');

    expect(res.status).toBe(200);
    expect(res.body.keys.length).toBeGreaterThan(0);

    const jwk = res.body.keys[0];
    expect(jwk).toHaveProperty('kid');
    expect(jwk).toHaveProperty('n');
    expect(jwk).toHaveProperty('e');
  });

  test('SQLite DB file exists', () => {
    expect(fs.existsSync(dbPath)).toBe(true);
  });

});
