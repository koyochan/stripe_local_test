require('dotenv').config();
const app = require('./app'); // app.js をインポート

const PORT = process.env.PORT || 4242;

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});