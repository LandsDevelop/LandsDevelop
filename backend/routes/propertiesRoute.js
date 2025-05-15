import express from 'express';
import { createProperty, getAllProperties } from '../controllers/propertyControl.js';
const router = express.Router();

router.post('/add', createProperty);
router.get('/all', getAllProperties);

export default router;
