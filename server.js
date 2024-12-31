require('dotenv').config();
const app = require('./app');

const PORT = 4242;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});