const express = require('express');
const multer = require('multer');
const Property = require('../models/Property');
const User = require('../models/User');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const jwt = require('jsonwebtoken');
const Interest = require('../models/Interest');

router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const data = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      contactEmail: user.email,
      contactPhone: user.mobile,
      userId: user._id,
    };

    if (req.body.selectedAmenities)
      data.selectedAmenities = JSON.parse(req.body.selectedAmenities);

    const property = await Property.create(data);
    res.json({ success: true, property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

router.get('/all', async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
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
    const property = await Property.findOneAndDelete({ _id: req.params.id, userId: decoded.id });
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

    const updates = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl,
    };

    const updated = await Property.findOneAndUpdate(
      { _id: req.params.id, userId: decoded.id },
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

    res.json(interests); // You’ll get { userId, propertyId {title, location}, timestamp }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch interests on your properties' });
  }
});

// PATCH /api/properties/:id/close
router.patch('/properties/:id/close', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');

    const updated = await Property.findOneAndUpdate(
      { _id: req.params.id, userId: decoded.id },
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
