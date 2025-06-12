// models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  location: String,
  totalArea: String,
  dimensions: String,
  developmentType: String,
  developerRatio: String,
  goodwill: String,
  advance: String,
  facing: String,
  mapLink: String,
  roadSize: String,
  areaUnit: String,
  address: String,
  landmark: String,
  selectedAmenities: [String],
  imageUrl: String,
  contactEmail: String,
  contactPhone: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dealStatus: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
});

module.exports = mongoose.model('Property', propertySchema);
