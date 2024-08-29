import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import Razorpay from 'razorpay';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const razorpay = new Razorpay({
    key_id: 'rzp_test_p9DwWiTZQqSyJk',
    key_secret: 'F4PemzpY3z0ybG7UQNA6aCfd'
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    // Simple chatbot logic
    let botResponse = 'I am sorry, I do not understand that.';

    if (userMessage.toLowerCase().includes('ticket')) {
        botResponse = 'Sure, I can help you with ticket booking. How many tickets do you need?';
    } else if (userMessage.toLowerCase().includes('hello')) {
        botResponse = 'Hello! How can I assist you today?';
    }

    res.json({ response: botResponse });
});

app.post('/pay', async (req, res) => {
    const { amount, currency } = req.body;

    const options = {
        amount: amount,
        currency: currency,
        receipt: 'receipt#1',
        payment_capture: 1
    };

    try {
        const response = await razorpay.orders.create(options);
        res.json(response);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});