// models/Interest.js
const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  userId: String, // user email
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interest', interestSchema);
