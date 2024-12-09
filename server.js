require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

// 公開キーを提供するエンドポイント
app.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Checkoutセッション作成エンドポイント
app.post('/create-checkout-session', async (req, res) => {
  const { quantity } = req.body;

  // おまけの計算
  let bonus = 0;
  if (quantity >= 10 && quantity < 20) {
    bonus = 1;
  } else if (quantity >= 20) {
    bonus = 2;
  }

  // line_itemsの配列を動的に生成
  const lineItems = [
    {
      price: 'price_1QU6uiLq3OLnMuJlFnyl4uLM', // チケットのPrice ID（有料）
      quantity: quantity, // 購入した枚数
    },
  ];

  // おまけがある場合のみ無料商品を追加
  if (bonus > 0) {
    lineItems.push({
      price_data: {
        currency: 'jpy',
        product_data: {
          name: 'おまけチケット',
        },
        unit_amount: 0, // 0円
      },
      quantity: bonus, // おまけの枚数
    });
  }

  try {
    // Checkoutセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems, // 動的に生成されたline_items
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(400).send({ error: { message: error.message } });
  }
});

// サーバー起動
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});