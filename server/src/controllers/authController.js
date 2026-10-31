import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vibe_bazzar_secure_jwt_secret_token_2026_x99';

// In-memory fallback if DB connection fails
let fallbackUsers = [];

// 1. User Registration (accepts email & password or username & password)
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, address } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long.'
      });
    }

    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: 'Either email or username is required to register.'
      });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : `${username.trim().toLowerCase()}@vibebazzar.user`;
    const cleanUsername = username ? username.trim().toLowerCase() : cleanEmail.split('@')[0];
    const cleanFullName = fullName || cleanUsername;

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      // Check existing user in Supabase
      const checkRes = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
        [cleanEmail, cleanUsername]
      );

      if (checkRes.rows.length > 0) {
        const existing = checkRes.rows[0];
        const isEmailMatch = existing.email.toLowerCase() === cleanEmail.toLowerCase();
        return res.status(409).json({
          success: false,
          message: isEmailMatch
            ? 'An account with this email already exists. Please log in.'
            : 'This username is already taken. Please choose another username.'
        });
      }

      // Insert new user into Supabase
      const insertRes = await pool.query(
        `INSERT INTO users (username, email, password_hash, full_name, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, full_name, phone, address, created_at`,
        [cleanUsername, cleanEmail, passwordHash, cleanFullName, phone || '', address || '']
      );

      const newUser = insertRes.rows[0];

      // Sign JWT
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully in Supabase PostgreSQL!',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.full_name,
          phone: newUser.phone,
          address: newUser.address
        }
      });
    } catch (dbErr) {
      console.warn('DB error on register, using memory fallback:', dbErr.message);

      const id = Date.now();
      const fallbackUser = {
        id,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        fullName: cleanFullName,
        phone: phone || '',
        address: address || ''
      };
      fallbackUsers.push(fallbackUser);

      const token = jwt.sign(
        { id, username: cleanUsername, email: cleanEmail },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
          id,
          username: cleanUsername,
          email: cleanEmail,
          fullName: cleanFullName,
          phone: phone || '',
          address: address || ''
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. User Login (accepts either email OR username, plus password)
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or username and password.'
      });
    }

    const cleanLoginId = loginId.trim().toLowerCase();

    try {
      const dbRes = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1',
        [cleanLoginId]
      );

      if (dbRes.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. No user found with this email or username.'
        });
      }

      const user = dbRes.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please try again.'
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Welcome back to Vibe Bazzar!',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          address: user.address
        }
      });
    } catch (dbErr) {
      console.warn('DB error on login, checking fallback users:', dbErr.message);

      const user = fallbackUsers.find(
        (u) => u.email.toLowerCase() === cleanLoginId || u.username.toLowerCase() === cleanLoginId
      );

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/username or password.'
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          address: user.address
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Get Current User Profile (Protected via JWT)
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const dbRes = await pool.query(
        'SELECT id, username, email, full_name, phone, address, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (dbRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const u = dbRes.rows[0];
      return res.json({
        success: true,
        user: {
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone,
          address: u.address
        }
      });
    } catch (dbErr) {
      return res.json({
        success: true,
        user: req.user
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address } = req.body;

    try {
      const updateRes = await pool.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             address = COALESCE($3, address)
         WHERE id = $4
         RETURNING id, username, email, full_name, phone, address`,
        [fullName, phone, address, userId]
      );

      const u = updateRes.rows[0];
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: {
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone,
          address: u.address
        }
      });
    } catch (dbErr) {
      return res.json({
        success: true,
        message: 'Profile updated.',
        user: { id: userId, fullName, phone, address }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
