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

// POST /api/add - Add new property (pending approval)
router.post('/add', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'plotDiagram', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      developmentType, totalArea, areaUnit,
      northSideLength, southSideLength, eastSideLength, westSideLength,
      facing, roadSize, developerRatio,
      city, locality, societyName, landmark, map, goodwill, advance,
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
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.phone) {
      return res.status(400).json({ error: 'User phone number not found' });
    }

    console.log(`Creating property for user: ${user.phone}`);

    const files = req.files;

    const newProperty = new Property({
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
      societyName: societyName || '',
      landmark,
      map,
      coordinates,
      goodwill: goodwill || '',
      advance: advance || '',
      description: description || '',
      address,
      selectedAmenities: selectedAmenities ? JSON.parse(selectedAmenities) : [],
      imageUrl: files['image'] ? `/uploads/${files['image'][0].filename}` : '',
      plotDiagramUrl: files['plotDiagram'] ? `/uploads/${files['plotDiagram'][0].filename}` : '',
      contactEmail: user.email || '',
      contactPhone: user.phone,
      phone: user.phone,
      userId: user._id.toString(),
      status: 'pending',  // Set to pending for admin approval
    });

    await newProperty.save();
    
    console.log(`Property saved successfully with phone: ${newProperty.phone}, status: pending`);
    
    res.status(200).json({ 
      message: 'Property submitted successfully! It will be visible after admin approval.', 
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

// GET /api/all - Get all APPROVED properties only
router.get('/all', async (req, res) => {
  try {
    const properties = await Property.find({ status: 'approved' });
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/user-properties-by-phone/:phone - Get properties by phone (all statuses for user)
router.get('/user-properties-by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`Fetching properties for phone: ${phone}`);
    
    const properties = await Property.find({ phone: phone });
    
    console.log(`Found ${properties.length} properties for phone: ${phone}`);
    
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/properties/:id', async (req, res) => {
  try {
    const project = await Property.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Only return if approved (unless requested by owner)
    if (project.status !== 'approved') {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          const user = await User.findById(decoded.id);
          
          // Allow owner or admin to see pending/rejected properties
          if (user && (user.phone === project.phone || user.phone === '9014011885')) {
            return res.json({ project });
          }
        } catch (err) {
          // Token invalid, proceed with rejection
        }
      }
      return res.status(404).json({ error: 'Project not found' });
    }
    
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
router.put('/properties/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'plotDiagram', maxCount: 1 }
]), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const files = req.files;

    const updates = {
      ...req.body,
      phone: user.phone,
      contactPhone: user.phone,
      status: 'pending',  // Reset to pending when edited
    };

    if (files['image']) {
      updates.imageUrl = `/uploads/${files['image'][0].filename}`;
    }
    if (files['plotDiagram']) {
      updates.plotDiagramUrl = `/uploads/${files['plotDiagram'][0].filename}`;
    }

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

// GET /api/search - Search APPROVED properties only
router.get('/search', async (req, res) => {
  try {
    const { q = '', developmentType, minArea, maxArea, ratio } = req.query;
    const regex = new RegExp(q, 'i');

    const match = { status: 'approved' };  // Only show approved properties
    
    if (q) {
      match.$or = [
        { city: regex }, 
        { locality: regex }, 
        { societyName: regex },
        { projectName: regex }, 
        { address: regex }, 
        { landmark: regex }
      ];
    }

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