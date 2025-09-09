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

// Build the exact message text that matches your DLT-approved template.
// Keep the approved text EXACT; only {{otp}} is substituted.
const buildOtpMessage = (otp) => {
  // If you have the exact approved text, put it here:
  // e.g., "Your OTP for LandsDevelop login is {{otp}}. It is valid for 5 minutes. Do not share."
  const template = process.env.AIRTEL_TEMPLATE_TEXT || 'Your OTP is {{otp}}';
  return template.replace('{{otp}}', otp);
};

// ====== Airtel Sender (prepaid endpoint + Basic auth) ======
const sendOTPViaAirtel = async (phone, otp) => {
  // Dev-mode short-circuit so you can test without balance
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_OTP === 'true') {
    const mock = { mock: true, note: 'Skipped Airtel send in dev (no balance)' };
    console.log(`MOCK OTP -> ${otp} to ${phone}`, mock);
    return mock;
  }

  const endpoint = process.env.AIRTEL_ENDPOINT; // e.g., https://iqsms.airtel.in/api/v1/send-prepaid-sms
  if (!endpoint) throw new Error('AIRTEL_ENDPOINT not set');

  // Basic <base64(username:password)>
  const basic = Buffer
    .from(`${process.env.AIRTEL_USERNAME}:${process.env.AIRTEL_PASSWORD}`)
    .toString('base64');

  const payload = {
    customerId: process.env.AIRTEL_CUSTOMER_ID,         // GUID from Technical Settings
    destinationAddress: [`91${phone}`],                 // 91XXXXXXXXXX
    dltTemplateId: process.env.AIRTEL_TEMPLATE_ID,      // your approved DLT template id
    entityId: process.env.AIRTEL_ENTITY_ID,             // AIR0...
    message: buildOtpMessage(otp),                      // must match DLT text ({{otp}} replaced)
    messageType: 'TEXT',
    sourceAddress: process.env.AIRTEL_HEADER_ID         // your header/sender (e.g., INVHST)
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${basic}`
  };

  const resp = await axios.post(endpoint, payload, { headers, timeout: 15000 });
  // Surface the full body for log visibility
  console.log('Airtel response:', resp.status, JSON.stringify(resp.data));

  // Accept any 2xx as success; Airtel may have its own codes in body
  if (resp.status < 200 || resp.status >= 300) {
    throw new Error(`Airtel returned non-2xx: ${resp.status}`);
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

    // Store/refresh OTP doc (5 min)
    await OTP.deleteMany({ phone });
    await new OTP({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }).save();

    try {
      const airtel = await sendOTPViaAirtel(phone, otp);
      return res.json({
        success: true,
        message: 'OTP API called',
        // In dev, surface debug to help you test without balance
        ...(process.env.NODE_ENV === 'development' && { debug: { otp, airtel } })
      });
    } catch (err) {
      console.error('Airtel OTP error:', err?.response?.data || err.message);
      if (process.env.NODE_ENV === 'development') {
        // Let you continue testing end-to-end in dev
        return res.json({
          success: true,
            message: 'OTP generated (SMS not sent in dev or balance issue)',
          debug: { otp, error: err?.response?.data || err.message }
        });
      }
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Internal server error during OTP send' });
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
        { id: existingUser._id },
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

    // Ensure OTP was verified recently
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
      { id: newUser._id },
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

// User by phone
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
