const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/', routes);

const PORT = 8080;

// Only start the server if NOT in test mode
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ JWKS Server running on http://localhost:${PORT}`);
    });
}

// Export app for Jest testing
module.exports = app;
