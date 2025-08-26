const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const axios = require('axios');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Airtel IQ OTP sender
const sendOTPViaAirtel = async (phone, otp) => {
  const url = 'https://dmc.aqi.in/api/v1/communication/sms';

  const payload = {
    headerId: process.env.AIRTEL_HEADER_ID,
    templateId: process.env.AIRTEL_TEMPLATE_ID,
    entityId: process.env.AIRTEL_ENTITY_ID,
    to: [`+91${phone}`],
    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    senderId: process.env.AIRTEL_HEADER_ID,
    variables: { otp }
  };

  const headers = {
    'Content-Type': 'application/json',
    'username': process.env.AIRTEL_USERNAME,
    'password': process.env.AIRTEL_PASSWORD
  };

  const response = await axios.post(url, payload, { headers });

  if (response.status === 200 && response.data.status === 'success') {
    console.log('✅ OTP sent successfully via Airtel IQ');
  } else {
    console.error('Airtel response:', response.data);
    throw new Error('❌ Failed to send OTP via Airtel IQ');
  }
};

// Send OTP route
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Please enter 10 digits.' });
    }

    console.log(`📲 Sending OTP to ${phone}`);

    const otp = generateOTP();
    await OTP.deleteMany({ phone });

    const otpRecord = new OTP({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins
    });
    await otpRecord.save();

    try {
      await sendOTPViaAirtel(phone, otp);
      res.json({
        success: true,
        message: 'OTP sent successfully via Airtel IQ',
        ...(process.env.NODE_ENV === 'development' && { debug: { otp, phone } })
      });
    } catch (err) {
      console.error('❌ Airtel OTP error:', err.message);
      if (process.env.NODE_ENV === 'development') {
        res.json({
          success: true,
          message: 'OTP generated (SMS failed in dev)',
          debug: { otp, error: err.message }
        });
      } else {
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
      }
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Internal server error during OTP send' });
  }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const otpRecord = await OTP.findOne({
      phone,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d'
      });

      return res.json({
        success: true,
        userExists: true,
        token,
        user: {
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone
        }
      });
    } else {
      return res.json({
        success: true,
        userExists: false,
        message: 'OTP verified. Please complete your profile.'
      });
    }
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// Complete Signup
router.post('/complete-signup', async (req, res) => {
  try {
    const { phone, firstName, lastName, email } = req.body;

    if (!phone || !firstName) {
      return res.status(400).json({ message: 'Phone and first name are required' });
    }

    const verifiedOTP = await OTP.findOne({
      phone,
      verified: true,
      expiresAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (!verifiedOTP) {
      return res.status(400).json({ message: 'Phone number not verified or verification expired' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      phone,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || '',
      email: email?.trim() || null,
      isVerified: true
    });

    await newUser.save();
    await OTP.deleteMany({ phone });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      token,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error('Complete signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Fetch user by phone
router.get('/user/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Remove legacy login
router.post('/login', async (req, res) => {
  res.status(400).json({
    message: 'Please use phone number login',
    redirectTo: '/phone-login'
  });
});

module.exports = router;
