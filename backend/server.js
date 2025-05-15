import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import uploadRoutes from './routes/uploads.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(uploadRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });


// ✅ MySQL DB Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }
  console.log('✅ MySQL connected');
});

// ✅ GET all properties
app.get('/api/all', (req, res) => {
  const sql = `
    SELECT id, title, location, image, totalArea, dimensions, developmentType,
           developerRatio, goodwill, advance, facing, mapLink,
           permission_type, permission_status, reraApproved, landconverted, titleClear,
           address, landmark, areaUnit, roadSize, selectedAmenities, createdAt
    FROM properties
    ORDER BY createdAt DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query failed' });
    res.json(results);
  });
});

// ✅ SIGNUP
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });

      db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        err => {
          if (err) return res.status(500).json({ error: 'Insert error' });
          res.status(200).json({ message: 'Signup successful' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.status(200).json({
      message: 'Login successful',
      token: 'dummy-token',
      user: {
        id: results[0].id,
        email: results[0].email,
        username: results[0].username
      }
    });
  });
});

app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM properties WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.json({ project: results[0] });
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

