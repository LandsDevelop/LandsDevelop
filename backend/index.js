import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute.js';
import propertyRoutes from './routes/propertiesRoute.js';
import db from './db.js';
import chatRoutes from './routes/chatRoute.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);        // /api/login, /api/signup
app.use('/api', propertyRoutes);    // /api/post-property
app.use('/api', chatRoutes);

// Test DB Connection
db.query('SELECT 1')
  .then(() => console.log('✅ MySQL connected'))
  .catch(err => console.error('❌ DB connection error:', err));

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;

