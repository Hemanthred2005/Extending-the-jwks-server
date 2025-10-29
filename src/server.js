const express = require('express');
const routes = require('./routes');
const { ready, db } = require('../db');
const { seed } = require('./seed_keys');

const app = express();
app.use(express.json());
app.use('/', routes);

const PORT = 8080;

(async () => {
  await ready;

  // seed if empty
  db.get(`SELECT COUNT(*) as c FROM keys`, (err, row) => {
    if (err) {
      console.error(err);
    } else if (row.c === 0) {
      seed().catch(console.error);
    }
  });

  app.listen(PORT, () => console.log(`✅ JWKS Server running on http://localhost:${PORT}`));
})();
