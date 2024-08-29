import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import Razorpay from 'razorpay';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

app.use(bodyParser.json());


const razorpay = new Razorpay({
    key_id: 'rzp_test_p9DwWiTZQqSyJk',
    key_secret: 'F4PemzpY3z0ybG7UQNA6aCfd'
});

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message.toLowerCase();

    let botResponse = 'I am sorry, I do not understand that.';

    if (userMessage.includes('ticket')) {
        botResponse = 'Sure, I can help you with ticket booking. How many tickets do you need?';
    } else if (userMessage.includes('hello')) {
        botResponse = 'Hello! How can I assist you today?';
    } else if (userMessage.includes('generate the museum tour ticket')) {
        botResponse = 'Generating your museum tour ticket...';
        await generatePDF();
        botResponse += ' Your ticket has been generated.';
    } else if (userMessage.includes('menu')) {
        botResponse = 'Here are the options:\n1. Book a ticket\n2. Generate the museum tour ticket\n3. Make a payment\n4. Start voice recognition\n5. Start image recognition';
    }

    res.json({ response: botResponse });
});

async function generatePDF() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const fontSize = 30;

    page.drawText('Museum Tour Ticket', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        color: rgb(0, 0.53, 0.71),
    });

    page.drawText('Thank you for booking a tour with us!', {
        x: 50,
        y: height - 6 * fontSize,
        size: fontSize,
        color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('ticket.pdf', pdfBytes);
}

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