const express = require('express');
const multer = require('multer');
const Property = require('../models/Property');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Interest = require('../models/Interest');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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
    
    const decoded = jwt.verify(token, 'secret');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
      selectedAmenities: JSON.parse(selectedAmenities || '[]'),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      contactEmail: user.email || '',
      contactPhone: user.phone,
      phone: user.phone, // Add explicit phone field
      userId: user._id.toString(),
    });

    await newProperty.save();
    res.status(200).json({ message: 'Property saved successfully' });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save property' });
  }
});

router.get('/all', async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
});

// New route to get properties by phone number
router.get('/user-properties-by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const properties = await Property.find({ phone: phone });
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

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

router.get('/user-properties', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, 'secret');
    const properties = await Property.find({ userId: decoded.id });
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user properties' });
  }
});

router.delete('/properties/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, 'secret');
    
    // Allow deletion by userId or phone number for flexibility
    const user = await User.findById(decoded.id);
    const property = await Property.findOneAndDelete({ 
      _id: req.params.id, 
      $or: [
        { userId: decoded.id },
        { phone: user.phone }
      ]
    });
    
    if (!property) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

router.put('/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, 'secret');
    const user = await User.findById(decoded.id);

    const updates = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl,
    };

    // Allow update by userId or phone number for flexibility
    const updated = await Property.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [
          { userId: decoded.id },
          { phone: user.phone }
        ]
      },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

router.post('/interests', async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const existing = await Interest.findOne({ userId, propertyId });
    if (!existing) await Interest.create({ userId, propertyId });
    res.status(200).json({ message: 'Interest recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save interest' });
  }
});

router.get('/interests/:userId', async (req, res) => {
  try {
    const interests = await Interest.find({ userId: req.params.userId }).populate('propertyId');
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

// GET /api/interests-owned-by-you
router.get('/interests-owned-by-you/:ownerEmail', async (req, res) => {
  try {
    const ownerEmail = req.params.ownerEmail;
    const ownerProps = await Property.find({ contactEmail: ownerEmail }).select('_id title location');

    const propertyIds = ownerProps.map(p => p._id);

    const interests = await Interest.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId');

    res.json(interests); // You'll get { userId, propertyId {title, location}, timestamp }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch interests on your properties' });
  }
});

// GET /api/search?q=hyd&developmentType=Villa&minArea=500&maxArea=2000&ratio=60:40
router.get('/search', async (req, res) => {
  try {
    const { q = '', developmentType, minArea, maxArea, ratio } = req.query;
    const regex = new RegExp(q, 'i'); // partial, case-insensitive

    // Base text match across common fields
    const match = q
      ? { $or: [{ city: regex }, { locality: regex }, { projectName: regex }, { address: regex }, { landmark: regex }] }
      : {};

    if (developmentType && developmentType !== 'All') {
      match.developmentType = new RegExp(`^${developmentType}$`, 'i');
    }
    if (ratio && ratio !== 'All') {
      match.developerRatio = new RegExp(`^${ratio}$`, 'i');
    }

    // Because totalArea is stored as String, convert on the fly for numeric filtering
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

    // Optional numeric filters
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

// PATCH /api/properties/:id/close
router.patch('/properties/:id/close', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');
    const user = await User.findById(decoded.id);

    // Allow closing by userId or phone number for flexibility
    const updated = await Property.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [
          { userId: decoded.id },
          { phone: user.phone }
        ]
      },
      { dealStatus: 'closed' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Property not found or unauthorized' });
    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to close deal' });
  }
});

module.exports = router;