// routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Property = require('../models/Property');
const User = require('../models/User');

const router = express.Router();

// Admin phone number - change this to your admin number
const ADMIN_PHONE = '9014011885';

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user || user.phone !== ADMIN_PHONE) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET all properties for admin (including pending)
router.get('/properties', isAdmin, async (req, res) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// PATCH approve property
router.patch('/properties/:id/approve', isAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ error: 'Failed to approve property' });
  }
});

// PATCH reject property
router.patch('/properties/:id/reject', isAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    console.error('Error rejecting property:', error);
    res.status(500).json({ error: 'Failed to reject property' });
  }
});

// GET property stats for admin dashboard
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const total = await Property.countDocuments();
    const pending = await Property.countDocuments({ status: 'pending' });
    const approved = await Property.countDocuments({ status: 'approved' });
    const rejected = await Property.countDocuments({ status: 'rejected' });

    res.json({
      total,
      pending,
      approved,
      rejected
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;