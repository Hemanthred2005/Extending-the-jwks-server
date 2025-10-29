const express = require('express');
const routes = require('./routes');
const { ready, db } = require('../db');
const { seed } = require('./seed_keys');

const app = express();
app.use(express.json());
app.use('/', routes);

// Export app for tests (NO .listen here)
module.exports = app;

async function bootstrap() {
  await ready;

  db.get(`SELECT COUNT(*) as c FROM keys`, async (err, row) => {
    if (err) {
      console.error("DB check error:", err);
      return;
    }
    if (row.c === 0) {
      console.log("⚠️ No keys → Seeding…");
      try {
        await seed();
        console.log("✅ DB seeded");
      } catch (seedErr) {
        console.error("Seed failure:", seedErr);
      }
    }
  });
}

// ✅ Only start listener if NOT running in tests
if (require.main === module) {
  const PORT = 8080;
  bootstrap().then(() => {
    app.listen(PORT, () => 
      console.log(`✅ JWKS Server running on http://localhost:${PORT}`)
    );
  });
}
