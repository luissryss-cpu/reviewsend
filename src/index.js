const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/send', async (req, res) => {
  const { customerName, customerPhone, businessName, reviewLink, delayMinutes } = req.body;

  const message = `Hi ${customerName}! Thanks for choosing ${businessName} today. We'd love a quick Google review — it really helps us out! ${reviewLink}`;

  const delayMs = (delayMinutes || 0) * 60 * 1000;

  setTimeout(async () => {
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customerPhone
      });
      console.log(`Text sent to ${customerName} at ${customerPhone}`);
    } catch (err) {
      console.error('Error sending text:', err);
    }
  }, delayMs);

  res.json({ success: true, message: `Text scheduled for ${customerName} in ${delayMinutes || 0} minutes` });
});

app.post('/bulk-send', async (req, res) => {
  const { customers, businessName, reviewLink } = req.body;

  for (const customer of customers) {
    const message = `Hi ${customer.name}! Thanks for choosing ${businessName} today. We'd love a quick Google review — it really helps us out! ${reviewLink}`;
    try {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customer.phone
      });
      console.log(`Bulk text sent to ${customer.name}`);
    } catch (err) {
      console.error(`Error sending to ${customer.name}:`, err);
    }
  }

  res.json({ success: true, message: `Texts sent to ${customers.length} customers` });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ReviewSend server running on port ${PORT}`);
});
