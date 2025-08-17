const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  projectName: String,
  developmentType: String,
  totalArea: String,
  areaUnit: String,
  // Plot dimensions for all four sides
  northSideLength: String,
  southSideLength: String,
  eastSideLength: String,
  westSideLength: String,
  dimensions: String, // Keep for backward compatibility
  roadSize: String,
  developerRatio: String,
  facing: String,
  goodwill: String,
  advance: String,
  address: String,
  city: String,
  landmark: String,
  locality: String,
  map: String,
  coordinates: String, // Store as JSON string
  description: String,
  selectedAmenities: [String],
  imageUrl: String,
  contactEmail: String,
  contactPhone: String, // This will store the user's phone number
  userId: String, // This will store the user's ID
  phone: String, // Add explicit phone field for easier querying
  dealStatus: { type: String, default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);