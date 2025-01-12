require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add CORS middleware
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT))
});
const db = admin.firestore();

// Initialize Express
const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// Endpoint to cancel subscription
app.post('/cancel-subscription', async (req, res) => {
    const { userId, subscriptionId } = req.body;

    if (!userId || !subscriptionId) {
        return res.status(400).send({ error: 'userId and subscriptionId are required' });
    }

    try {
        // Step 1: Update subscription via Stripe
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        // Step 2: Update Firestore
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ subscriptionStatus: 'dying' });

        res.send({
            message: 'Subscription updated to cancel at the end of the current period',
            subscription: updatedSubscription,
        });
    } catch (error) {
        console.error('Error during cancellation:', error);
        res.status(500).send({ error: error.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
