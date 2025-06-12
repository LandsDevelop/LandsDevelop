const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User({ name, email, password, mobile });
    await newUser.save();

    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET user details by email
router.get('/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ name: user.name, email: user.email, mobile: user.mobile });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

module.exports = router;
