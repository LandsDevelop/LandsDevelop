import express from 'express';
import multer from 'multer';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),

  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const uploads = multer({ storage });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

router.post('/api/add', uploads.single('image'), (req, res) => {
  const {
    title, location, totalArea, dimensions, developmentType,
    developerRatio, goodwill, advance, facing, mapLink,
    permission_type, permission_status, reraApproved, landconverted, titleClear,
    roadSize, areaUnit, address, landmark
  } = req.body;

  const selectedAmenities = JSON.parse(req.body.selectedAmenities || '[]');
  const imageUrl = `http://localhost:5174/uploads/${req.file?.filename}`;
console.log("Received body:", req.body);
console.log("Received file:", req.file);

const sql = `
  INSERT INTO properties (
    title, location, image, totalArea, dimensions, developmentType,
    developerRatio, goodwill, advance, facing, mapLink,
    permission_type, permission_status, reraApproved, landconverted, titleClear,
    address, landmark, areaUnit, roadSize, selectedAmenities, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;

const values = [
  title, location, imageUrl, totalArea, dimensions, developmentType,
  developerRatio, goodwill, advance, facing, mapLink,
  permission_type, permission_status, reraApproved, landconverted, titleClear,
  address, landmark, areaUnit, roadSize, JSON.stringify(selectedAmenities)
];


 db.query(sql, values, err => {
  if (err) {
    console.error('Insert failed:', err);
    console.log("Final values:", values);
    return res.status(500).json({ error: 'Insert error' }); // ❗ return to prevent fallthrough
  }

  res.status(200).json({
    message: 'Property added',
    image: imageUrl
  });
});

});

export default router;
