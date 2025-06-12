const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');
require('./db');
require('./models/Interest');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Apply routes only once
app.use('/api', authRoutes);
app.use('/api', propertyRoutes);

app.listen(5174, () => {
  console.log('🚀 Server running on http://localhost:5174');
});
