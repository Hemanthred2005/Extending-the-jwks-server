const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = require('../src/server'); // ensure correct path

const dbPath = path.join(__dirname, '../keys.db');

describe('JWKS Server Tests', () => {

  test('/auth returns a valid JWT', async () => {
    const res = await request(app).post('/auth')
      .auth('userABC', 'password123'); 
  
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  
    const decoded = jwt.decode(res.body.token, { complete: true });
    expect(decoded.payload).toHaveProperty('exp');
    expect(decoded.header).toHaveProperty('kid');
  });
  

  test('/auth?expired=true returns an expired JWT', async () => {
    const res = await request(app).post('/auth?expired=true')
      .auth('userABC', 'password123');

    const decoded = jwt.decode(res.body.token);
    expect(decoded.exp < Math.floor(Date.now() / 1000)).toBe(true);
  });

  test('/well-known/jwks.json exposes public keys', async () => {
    const res = await request(app).get('/.well-known/jwks.json');

    expect(res.status).toBe(200);
    expect(res.body.keys.length).toBeGreaterThan(0);
    expect(res.body.keys[0]).toHaveProperty('kid');
  });

  test('SQLite DB file exists and has keys', () => {
    const exists = fs.existsSync(dbPath);
    expect(exists).toBe(true);
  });

});
