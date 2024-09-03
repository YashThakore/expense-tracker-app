// backend/routes/auth.js
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login request received:', username); // Debug log
      const user = await User.findOne({ username });
      if (!user || !(await user.comparePassword(password))) {
        console.log('Invalid credentials'); // Debug log
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Login successful, sending token'); // Debug log
      res.json({ token });
    } catch (err) {
      console.error('Login error:', err); // Debug log
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
