const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  projectName: { 
    type: String, 
    default: ''  // Made optional
  },
  developmentType: { 
    type: String, 
    required: true 
  },
  totalArea: { 
    type: String, 
    required: true 
  },
  areaUnit: { 
    type: String, 
    default: 'Sq Yards' 
  },
  // Plot dimensions for all four sides (in feet)
  northSideLength: { 
    type: String, 
    default: '' 
  },
  southSideLength: { 
    type: String, 
    default: '' 
  },
  eastSideLength: { 
    type: String, 
    default: '' 
  },
  westSideLength: { 
    type: String, 
    default: '' 
  },
  dimensions: { 
    type: String, 
    default: '' 
  },
  roadSize: { 
    type: String, 
    default: ''  // In feet now
  },
  developerRatio: { 
    type: String, 
    default: '' 
  },
  facing: { 
    type: String, 
    default: '' 
  },
  goodwill: { 
    type: String, 
    default: ''  // Optional
  },
  advance: { 
    type: String, 
    default: ''  // Optional
  },
  address: { 
    type: String, 
    default: '' 
  },
  city: { 
    type: String, 
    required: true 
  },
  landmark: { 
    type: String, 
    required: true  // Made required
  },
  locality: { 
    type: String, 
    required: true 
  },
  societyName: {  // NEW: For apartment/society name
    type: String,
    default: ''
  },
  map: { 
    type: String, 
    default: '' 
  },
  coordinates: { 
    type: String, 
    default: '' 
  },
  description: { 
    type: String, 
    default: ''  // Optional
  },
  selectedAmenities: { 
    type: [String], 
    default: [] 
  },
  imageUrl: { 
    type: String, 
    default: '' 
  },
  plotDiagramUrl: {  // NEW: For 2D plot diagram
    type: String,
    default: ''
  },
  contactEmail: { 
    type: String, 
    default: '' 
  },
  contactPhone: { 
    type: String, 
    default: '' 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  phone: { 
    type: String, 
    default: '',
    index: true 
  },
  dealStatus: { 
    type: String, 
    default: 'open',
    enum: ['open', 'closed']
  },
  status: {  // NEW: For admin approval
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
    index: true
  }
}, { 
  timestamps: true 
});

// Add indexes for common queries
propertySchema.index({ city: 1, locality: 1 });
propertySchema.index({ developmentType: 1 });
propertySchema.index({ dealStatus: 1 });
propertySchema.index({ status: 1 });

module.exports = mongoose.model('Property', propertySchema);