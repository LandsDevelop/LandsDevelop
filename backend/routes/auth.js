// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');

// MSG91 Configuration with fallback values
const MSG91_API_KEY = process.env.MSG91_API_KEY || '462814AWBgLhJnr96e688ced38P1';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || '688cee38ae5d3f287c6627c5';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'OTPSMS';

console.log('MSG91 Config:', {
  apiKey: MSG91_API_KEY ? MSG91_API_KEY.substring(0, 10) + '...' : 'Not set',
  templateId: MSG91_TEMPLATE_ID,
  senderId: MSG91_SENDER_ID
});

// Function to send OTP using MSG91 OTP API (Method 1)
const sendOTPMethod1 = async (phone, otp) => {
  try {
    console.log(`Method 1: Sending OTP to ${phone} with OTP: ${otp}`);
    
    const url = 'https://api.msg91.com/api/v5/otp';
    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      authkey: MSG91_API_KEY,
      otp: otp,
      sender: MSG91_SENDER_ID,
      route: "4"
    };

    console.log('Method 1 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Method 1 Response Status:', response.status);
    console.log('Method 1 Response:', responseText);

    if (!response.ok) {
      throw new Error(`Method 1 Error: ${response.status} - ${responseText}`);
    }

    return { success: true, response: responseText };
  } catch (error) {
    console.error('Method 1 failed:', error.message);
    throw error;
  }
};

// Function to send OTP using MSG91 Send SMS API (Method 2)
const sendOTPMethod2 = async (phone, otp) => {
  try {
    console.log(`Method 2: Sending OTP to ${phone} with OTP: ${otp}`);
    
    const message = `Your verification code is ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    const encodedMessage = encodeURIComponent(message);
    
    const url = `https://api.msg91.com/api/sendSms.php?authkey=${MSG91_API_KEY}&mobiles=91${phone}&message=${encodedMessage}&sender=${MSG91_SENDER_ID}&route=4&country=91`;

    console.log('Method 2 URL:', url);

    const response = await fetch(url, {
      method: 'GET'
    });

    const responseText = await response.text();
    console.log('Method 2 Response Status:', response.status);
    console.log('Method 2 Response:', responseText);

    if (!response.ok) {
      throw new Error(`Method 2 Error: ${response.status} - ${responseText}`);
    }

    return { success: true, response: responseText };
  } catch (error) {
    console.error('Method 2 failed:', error.message);
    throw error;
  }
};

// Function to send OTP using Control Panel API (Method 3)
const sendOTPMethod3 = async (phone, otp) => {
  try {
    console.log(`Method 3: Sending OTP to ${phone} with OTP: ${otp}`);
    
    const url = 'https://control.msg91.com/api/v5/otp';
    const payload = {
      authkey: MSG91_API_KEY,
      template_id: MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      sender: MSG91_SENDER_ID,
      otp: otp,
      route: "4"
    };

    console.log('Method 3 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Method 3 Response Status:', response.status);
    console.log('Method 3 Response:', responseText);

    if (!response.ok) {
      throw new Error(`Method 3 Error: ${response.status} - ${responseText}`);
    }

    return { success: true, response: responseText };
  } catch (error) {
    console.error('Method 3 failed:', error.message);
    throw error;
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Route
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number. Please enter 10 digits.' });
    }

    console.log(`Processing OTP request for phone: ${phone}`);

    // Generate OTP
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp} for phone: ${phone}`);

    // Save OTP to database (remove any existing OTPs for this phone)
    await OTP.deleteMany({ phone });
    const otpRecord = new OTP({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
    await otpRecord.save();
    console.log('OTP saved to database');

    // Try multiple methods to send SMS
    let smsSuccess = false;
    let successMethod = '';
    let lastError = null;

    // Try Method 1: Standard OTP API
    try {
      await sendOTPMethod1(phone, otp);
      smsSuccess = true;
      successMethod = 'OTP API (Method 1)';
      console.log('✅ SMS sent successfully using Method 1');
    } catch (error1) {
      console.log('❌ Method 1 failed, trying Method 2');
      lastError = error1;

      // Try Method 2: Send SMS API
      try {
        await sendOTPMethod2(phone, otp);
        smsSuccess = true;
        successMethod = 'Send SMS API (Method 2)';
        console.log('✅ SMS sent successfully using Method 2');
      } catch (error2) {
        console.log('❌ Method 2 failed, trying Method 3');
        lastError = error2;

        // Try Method 3: Control Panel API
        try {
          await sendOTPMethod3(phone, otp);
          smsSuccess = true;
          successMethod = 'Control Panel API (Method 3)';
          console.log('✅ SMS sent successfully using Method 3');
        } catch (error3) {
          console.log('❌ All methods failed');
          lastError = error3;
        }
      }
    }

    if (smsSuccess) {
      res.json({ 
        success: true, 
        message: `OTP sent successfully via ${successMethod}`,
        // Remove this in production - only for testing
        debug: process.env.NODE_ENV === 'development' ? { otp, phone, method: successMethod } : undefined
      });
    } else {
      console.error('Failed to send SMS via all methods:', lastError);
      
      // In development, still allow the process to continue
      if (process.env.NODE_ENV === 'development') {
        res.json({ 
          success: true, 
          message: 'OTP generated (SMS service temporarily unavailable)',
          debug: { otp, phone, error: 'All SMS methods failed', lastError: lastError.message }
        });
      } else {
        res.status(500).json({ 
          message: 'Failed to send OTP. Please try again.',
          error: 'SMS service unavailable'
        });
      }
    }

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to process OTP request' });
  }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log(`Verifying OTP for phone: ${phone}, OTP: ${otp}`);

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      phone,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      console.log('Invalid or expired OTP');
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    console.log('OTP verified successfully');

    // Check if user exists
    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      // Existing user - generate token and login
      const token = jwt.sign({ id: existingUser._id }, 'secret', { expiresIn: '7d' });
      
      console.log('Existing user logged in');
      res.json({
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
      // New user - proceed to details collection
      console.log('New user - proceeding to profile completion');
      res.json({
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

// Complete Signup Route
router.post('/complete-signup', async (req, res) => {
  try {
    const { phone, firstName, lastName, email } = req.body;

    console.log(`Completing signup for phone: ${phone}`);

    // Validate required fields
    if (!phone || !firstName) {
      return res.status(400).json({ message: 'Phone and first name are required' });
    }

    // Verify that OTP was verified for this phone
    const verifiedOTP = await OTP.findOne({
      phone,
      verified: true,
      expiresAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } // Within last 10 minutes
    });

    if (!verifiedOTP) {
      return res.status(400).json({ message: 'Phone number not verified or verification expired' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      phone,
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      email: email && email.trim() ? email.trim() : null,
      isVerified: true
    });

    await newUser.save();
    console.log('New user created successfully');

    // Generate token
    const token = jwt.sign({ id: newUser._id }, 'secret', { expiresIn: '7d' });

    // Clean up OTP records for this phone
    await OTP.deleteMany({ phone });

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

// Get user details by phone
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

// Test SMS endpoint (for debugging - remove in production)
router.post('/test-sms', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const { phone } = req.body;
    const testOTP = '123456';
    
    console.log(`Testing SMS to: ${phone}`);
    
    let result = { success: false, methods: [] };

    // Test Method 1
    try {
      await sendOTPMethod1(phone, testOTP);
      result.methods.push({ method: 1, status: 'success', name: 'OTP API' });
      result.success = true;
    } catch (error) {
      result.methods.push({ method: 1, status: 'failed', name: 'OTP API', error: error.message });
    }

    // Test Method 2
    try {
      await sendOTPMethod2(phone, testOTP);
      result.methods.push({ method: 2, status: 'success', name: 'Send SMS API' });
      result.success = true;
    } catch (error) {
      result.methods.push({ method: 2, status: 'failed', name: 'Send SMS API', error: error.message });
    }

    // Test Method 3
    try {
      await sendOTPMethod3(phone, testOTP);
      result.methods.push({ method: 3, status: 'success', name: 'Control Panel API' });
      result.success = true;
    } catch (error) {
      result.methods.push({ method: 3, status: 'failed', name: 'Control Panel API', error: error.message });
    }

    res.json(result);
    
  } catch (error) {
    console.error('Test SMS Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy login route (for backward compatibility)
router.post('/login', async (req, res) => {
  res.status(400).json({ 
    message: 'Please use phone number login',
    redirectTo: '/phone-login'
  });
});

module.exports = router;