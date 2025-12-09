const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  projectName: { 
    type: String, 
    required: true 
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
  // Plot dimensions for all four sides
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
  }, // Keep for backward compatibility
  roadSize: { 
    type: String, 
    default: '' 
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
    default: '' 
  },
  advance: { 
    type: String, 
    default: '' 
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
    default: '' 
  },
  locality: { 
    type: String, 
    required: true 
  },
  map: { 
    type: String, 
    default: '' 
  },
  coordinates: { 
    type: String, 
    default: '' 
  }, // Store as JSON string
  description: { 
    type: String, 
    default: '' 
  },
  selectedAmenities: { 
    type: [String], 
    default: [] 
  },
  imageUrl: { 
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
}, { 
  timestamps: true 
});

// Add indexes for common queries
propertySchema.index({ city: 1, locality: 1 });
propertySchema.index({ developmentType: 1 });
propertySchema.index({ dealStatus: 1 });

module.exports = mongoose.model('Property', propertySchema);