// models/OTP.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 300 // 5 minutes in seconds
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Index for automatic cleanup
otpSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);