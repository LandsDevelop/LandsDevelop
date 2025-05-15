import db from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {
    const { name, email, password, mobile } = req.body;
    try {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (full_name, email, password_hash, mobile) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, mobile]
      );
  
      const newUserId = result.insertId;
      const token = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      res.status(200).json({
        message: 'User created',
        token,
        user: { id: newUserId, name, email }
      });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

  export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);
  
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      console.log('📥 DB response:', rows);
  
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email
        }
      });
    } catch (err) {
      console.error('❌ Login error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
  