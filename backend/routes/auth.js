// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('../models/User');
const OTP = require('../models/OTP');

// ====== Helpers ======
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ====== SMS Sender (uniquedigitaloutreach) ======
const sendOTPViaSMS = async (phone, otp) => {
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_OTP === 'true') {
    const mock = { mock: true, note: 'Skipped SMS send in dev (MOCK_OTP=true)' };
    console.log(`MOCK OTP -> ${otp} to ${phone}`, mock);
    return mock;
  }

  const endpoint = 'https://api.uniquedigitaloutreach.com/v1/sms';
  const apiKey = process.env.SMS_API_KEY || 'oZXPyKMN7FY0rwd6LV5f4P6KOoyTOR';
  const sender = process.env.SMS_SENDER || 'INVHST';
  const templateId = process.env.SMS_TEMPLATE_ID || '1007877623645681439';

  // The DLT-registered template uses {#var#} as the OTP placeholder
  const text = `${otp} One time Password(OTP) for phone verification on www.landsdevelop.com real estate platform`;

  const payload = {
    sender,
    to: `91${phone}`,       // prepend country code
    text,
    type: 'OTP',
    templateId
  };

  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey
  };

  console.log(`📤 Sending OTP ${otp} to 91${phone}...`);

  const resp = await axios.post(endpoint, payload, { headers, timeout: 15000 });
  console.log('SMS API response:', resp.status, JSON.stringify(resp.data));

  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(`SMS API returned non-2xx: ${resp.status}`);
  }

  return resp.data;
};

// ====== Routes ======

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Please enter 10 digits.' });
    }

    const otp = generateOTP();

    // Remove any existing OTPs for this phone
    await OTP.deleteMany({ phone });

    // Save new OTP
    await new OTP({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }).save();

    console.log(`🔐 OTP for ${phone} is: ${otp}`);

    // Send via SMS
    await sendOTPViaSMS(phone, otp);

    return res.json({
      success: true,
      message: 'OTP sent successfully to your phone number'
      // ⚠️  Do NOT return otp in production — remove the line below if you add it back
    });

  } catch (err) {
    console.error('Send OTP error:', err.message || err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP
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
      const token = jwt.sign(
        { id: existingUser._id, phone: existingUser.phone },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

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
    }

    // New user → front-end will collect details
    return res.json({
      success: true,
      userExists: false,
      message: 'OTP verified. Please complete your profile.'
    });

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

    // Ensure OTP was verified recently (within last 10 minutes)
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

    const token = jwt.sign(
      { id: newUser._id, phone: newUser.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

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

// Get user by phone
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

// Legacy stub
router.post('/login', async (_req, res) => {
  res.status(400).json({
    message: 'Please use phone number login',
    redirectTo: '/phone-login'
  });
});

module.exports = router;