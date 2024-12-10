const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./tenxer-education-firebase-adminsdk-26dqu-bb9f77bf64.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

app.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.post('/create-checkout-session', async (req, res) => {
  const { quantity, userId } = req.body;

  let bonus = 0;
  if (quantity >= 10 && quantity < 20) {
    bonus = 1;
  } else if (quantity >= 20) {
    bonus = 2;
  }

  try {
    const lineItems = [
      {
        price: 'price_1QU6uiLq3OLnMuJlFnyl4uLM',
        quantity: quantity,
      },
    ];

    if (bonus > 0) {
      lineItems.push({
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'おまけチケット', 
          },
          unit_amount: 0,
        },
        quantity: bonus,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: 'http://localhost:4242/success',
      cancel_url: 'http://localhost:4242/cancel',
      metadata: {
        userId,
        quantity,
        bonus,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const quantity = parseInt(session.metadata.quantity, 10) || 0;
    const bonus = parseInt(session.metadata.bonus, 10) || 0;

    try {
      const userRef = db.collection('Users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error(`User with ID ${userId} not found.`);
        return res.status(404).send(`User with ID ${userId} not found.`);
      }

      await userRef.update({
        tickets: admin.firestore.FieldValue.increment(quantity + bonus),
      });

      console.log(`User ${userId} tickets updated: +${quantity + bonus}`);
      res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.error('Error updating Firestore:', error);
      res.status(500).send('Error updating Firestore');
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
    res.status(400).send('Unhandled event type');
  }
});

module.exports = app;