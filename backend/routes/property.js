const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Property = require('../models/Property');
const User = require('../models/User');
const Interest = require('../models/Interest');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/add - Add new property
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const {
      projectName, developmentType, totalArea, areaUnit,
      northSideLength, southSideLength, eastSideLength, westSideLength,
      facing, roadSize, developerRatio,
      city, locality, landmark, map, goodwill, advance,
      description, address, selectedAmenities, coordinates
    } = req.body;

    // Get user details from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // ✅ Get user from database to ensure we have phone number
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Ensure phone number is available
    if (!user.phone) {
      return res.status(400).json({ error: 'User phone number not found' });
    }

    console.log(`Creating property for user: ${user.phone}`);

    const newProperty = new Property({
      projectName,
      developmentType,
      totalArea,
      areaUnit,
      northSideLength,
      southSideLength,
      eastSideLength,
      westSideLength,
      facing,
      roadSize,
      developerRatio,
      city,
      locality,
      landmark,
      map,
      coordinates,
      goodwill,
      advance,
      description,
      address,
      selectedAmenities: selectedAmenities ? JSON.parse(selectedAmenities) : [],
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      contactEmail: user.email || '',
      contactPhone: user.phone,  // ✅ Always set from user object
      phone: user.phone,          // ✅ Always set from user object
      userId: user._id.toString(),
    });

    await newProperty.save();
    
    console.log(`Property saved successfully with phone: ${newProperty.phone}`);
    
    res.status(200).json({ 
      message: 'Property saved successfully', 
      property: newProperty 
    });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ 
      error: 'Failed to save property', 
      details: err.message 
    });
  }
});

// GET /api/all - Get all properties
router.get('/all', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/user-properties-by-phone/:phone - Get properties by phone
router.get('/user-properties-by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`Fetching properties for phone: ${phone}`);
    
    // ✅ Search by phone field
    const properties = await Property.find({ phone: phone });
    
    console.log(`Found ${properties.length} properties for phone: ${phone}`);
    
    res.json(properties);
  } catch (err) {
    console.error('Error fetching user properties:', err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/properties/:id', async (req, res) => {
  try {
    const project = await Property.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching project' });
  }
});

// GET /api/user-properties - Get current user's properties
router.get('/user-properties', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // ✅ Search by phone number
    const properties = await Property.find({ phone: user.phone });
    
    console.log(`Found ${properties.length} properties for user phone: ${user.phone}`);
    
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/properties/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // ✅ Match by phone number
    const property = await Property.findOneAndDelete({ 
      _id: req.params.id, 
      phone: user.phone
    });
    
    if (!property) {
      return res.status(404).json({ 
        error: 'Property not found or you do not have permission to delete it' 
      });
    }
    
    console.log(`Property deleted successfully by user: ${user.phone}`);
    
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {
      ...req.body,
      phone: user.phone,  // ✅ Ensure phone is always set
      contactPhone: user.phone,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl,
    };

    // ✅ Match by phone number
    const updated = await Property.findOneAndUpdate(
      { 
        _id: req.params.id, 
        phone: user.phone
      },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        error: 'Property not found or you do not have permission to update it' 
      });
    }
    
    console.log(`Property updated successfully by user: ${user.phone}`);
    
    res.json({ success: true, updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// POST /api/interests - Record interest
router.post('/interests', async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const existing = await Interest.findOne({ userId, propertyId });
    if (!existing) await Interest.create({ userId, propertyId });
    res.status(200).json({ message: 'Interest recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save interest' });
  }
});

// GET /api/interests/:userId - Get user's interests
router.get('/interests/:userId', async (req, res) => {
  try {
    const interests = await Interest.find({ userId: req.params.userId }).populate('propertyId');
    res.json(interests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

// GET /api/interests-owned-by-you/:ownerEmail - Get interests on your properties
router.get('/interests-owned-by-you/:ownerEmail', async (req, res) => {
  try {
    const ownerEmail = req.params.ownerEmail;
    const ownerProps = await Property.find({ contactEmail: ownerEmail }).select('_id projectName locality');

    const propertyIds = ownerProps.map(p => p._id);

    const interests = await Interest.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId');

    res.json(interests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch interests on your properties' });
  }
});

// GET /api/search - Search properties
router.get('/search', async (req, res) => {
  try {
    const { q = '', developmentType, minArea, maxArea, ratio } = req.query;
    const regex = new RegExp(q, 'i');

    const match = q
      ? { $or: [{ city: regex }, { locality: regex }, { projectName: regex }, { address: regex }, { landmark: regex }] }
      : {};

    if (developmentType && developmentType !== 'All') {
      match.developmentType = new RegExp(`^${developmentType}$`, 'i');
    }
    if (ratio && ratio !== 'All') {
      match.developerRatio = new RegExp(`^${ratio}$`, 'i');
    }

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          totalAreaNum: {
            $cond: [
              { $ne: ['$totalArea', null] },
              { $toDouble: '$totalArea' },
              null
            ]
          }
        }
      }
    ];

    const and = [];
    if (minArea) and.push({ $gte: ['$totalAreaNum', Number(minArea)] });
    if (maxArea) and.push({ $lte: ['$totalAreaNum', Number(maxArea)] });
    if (and.length) pipeline.push({ $match: { $expr: { $and: and } } });

    const results = await Property.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// PATCH /api/properties/:id/close - Close deal
router.patch('/properties/:id/close', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Match by phone number
    const updated = await Property.findOneAndUpdate(
      { 
        _id: req.params.id, 
        phone: user.phone
      },
      { dealStatus: 'closed' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        error: 'Property not found or you do not have permission to close this deal' 
      });
    }
    
    console.log(`Deal closed successfully by user: ${user.phone}`);
    
    res.json({ success: true, updated });
  } catch (err) {
    console.error('Close deal error:', err);
    res.status(500).json({ error: 'Failed to close deal' });
  }
});

module.exports = router;