// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');
require('dotenv').config(); // Add this for environment variables
require('./db');
require('./models/Interest');
require('./models/OTP'); // Add OTP model

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Apply routes
app.use('/api', authRoutes);
app.use('/api', propertyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(5174, () => {
  console.log('🚀 Server running on http://localhost:5174');
  console.log('📱 Phone OTP authentication enabled');
});

module.exports = app;