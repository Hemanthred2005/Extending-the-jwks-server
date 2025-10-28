const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use('/', routes);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`✅ JWKS Server running on http://localhost:${PORT}`);
});
