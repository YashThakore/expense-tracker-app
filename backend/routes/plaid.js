// backend/routes/plaid.js
const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User'); // Make sure to import your User model

// Configure Plaid client
const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user; // Assign user data to req.user
    next();
  });
};

// Create a Plaid Link Token
router.post('/create_link_token', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('User ID:', userId); // Debug log to verify userId

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId.toString() },
      client_name: 'Plaid Expenses App',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    console.log('Plaid link token created successfully:', response.data); // Log successful response
    res.json(response.data);
  } catch (err) {
    console.error('Error creating Plaid link token:', err.response?.data || err.message || err); // Improved error logging
    res.status(500).json({ error: 'An error occurred while creating the link token' });
  }
});

// Exchange Public Token for Access Token
router.post('/exchange_public_token', authenticateJWT, async (req, res) => {
  const { public_token } = req.body;

  try {
    if (!public_token) {
      console.error('Public token is missing from the request'); // Log error
      return res.status(400).json({ error: 'Public token is required' });
    }

    console.log('Exchanging public token:', public_token); // Log the public token for debugging

    const tokenResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = tokenResponse.data;
    const userId = req.user.userId;

    // Update the user with Plaid access token and item id
    await User.findByIdAndUpdate(userId, { plaidAccessToken: access_token, plaidItemId: item_id });

    console.log('Plaid access token exchanged successfully.'); // Log success
    res.json({ message: 'Plaid account connected' });
  } catch (err) {
    console.error('Error exchanging Plaid public token:', err.response?.data || err.message || err); // Improved error logging
    res.status(500).json({ error: 'An error occurred while exchanging the public token' });
  }
});

// Get Transactions
router.get('/transactions', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  
  if (!user || !user.plaidAccessToken) {
    console.log('User not connected to Plaid or no access token found.');
    return res.status(404).json({ error: 'User not connected to Plaid' });
  }

  try {
    console.log('Fetching transactions for user:', userId);
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: '2010-01-01', // A far past date to cover all possible transactions
      end_date: new Date().toISOString().split('T')[0], // Current date
    });

    console.log('Transactions fetched from Plaid:', transactionsResponse.data.transactions);
    res.json(transactionsResponse.data.transactions);
  } catch (err) {
    console.error('Error fetching transactions from Plaid:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
});


module.exports = router;
