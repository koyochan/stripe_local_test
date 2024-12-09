function handleStripeWebhook(req, res) {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    console.log('Checkout session completed:', event.data.object);
  }

  res.status(200).send();
}

module.exports = handleStripeWebhook;