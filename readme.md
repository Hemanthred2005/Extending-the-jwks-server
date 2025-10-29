# 🔐 JWKS Server — Project 2


A JSON Web Key Set auth server using Node.js + Express + SQLite.

This project implements a **JWKS (JSON Web Key Set) Authentication Server** using:
- Node.js + Express  
- SQLite for secure private key storage  
- JWT (RS256 algorithm)  
- JWKS public endpoint for verification by external services  

The server supports **valid** and **expired** token generation for testing auth flows.

---

## Setup & Run


git clone https://github.com/Hemanthreddy2005/jwks-server
cd jwks-server
npm install
npm start


Server runs at:
http://localhost:8080


---

## API Endpoints

| Endpoint | Method | Description |
|---------|--------|-------------|
| `/auth` | POST | Returns valid JWT |
| `/auth?expired=true` | POST | Returns expired JWT |
| `/.well-known/jwks.json` | GET | Returns JWKS public keys for verification |

Example request:
POST /auth with Basic Auth:
    username: userABC
    password: password123

curl -u userABC:password123 http://localhost:8080/auth



####Database (SQLite)#####

#File: keys.db (auto-created)
#Stores RSA private & public keys
#Tracks expired vs active keys

#Re-seed database manually:

rm keys.db
node src/seed_keys.js

#Testing
npm test


📁 jwks-server/
│
├── src/
│   ├── server.js         Main Express server. Sets up routes and JWT logic.
│   ├── routes.js         Defines API routes: /auth and /.well-known/jwks.json
│   ├── seed_keys.js      Script to insert private keys into SQLite database.
│
├── tests/
│   ├── server.test.js    Jest test suite to validate endpoints using Supertest.
│
├── db.js                 SQLite DB connection helper that reads private keys table.
│
├── util.js               Utility helpers (base64 conversion, JWK formatting, etc.)
|
├── Keys.db               SQLite database storing JWT signing keys.
│
├── package.json          npm dependencies + Jest config + script shortcuts.
|
├── package-lock.json     Auto-generated dependency lock file.
│
├── README.md             Project documentation.
│
├── coverage/             auto-generated test coverage report after running tests.
│
└── node_modules/         DO NOT TOUCH. npm dependencies installed here.



