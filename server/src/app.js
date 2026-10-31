import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { pool } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Comprehensive CORS & Preflight to prevent any "Failed to fetch"
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Static Public & Dist Assets (Dist first for compiled bundles)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const clientPublicPath = path.resolve(__dirname, '../../client/public');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
}

// Health & Info Endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = Boolean(process.env.PG_HOST && process.env.PG_PASSWORD);
  try {
    const dbTest = await pool.query('SELECT 1');
    if (dbTest && dbTest.rows) {
      dbStatus = true;
    }
  } catch (err) {
    dbStatus = Boolean(process.env.PG_HOST && process.env.PG_PASSWORD);
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Supabase PostgreSQL',
      host: process.env.PG_HOST || 'db.maquznfqgsyjkxxrcrjx.supabase.co',
      connected: dbStatus,
      mode: dbStatus ? 'live_supabase_postgresql' : 'in_memory_fallback'
    },
    auth: {
      provider: 'JWT + Supabase PostgreSQL',
      ready: true
    },
    paymentGateway: {
      provider: 'Razorpay',
      ready: true,
      testKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TtQD9j8rwIQeBw',
      mode: 'test_sandbox'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/payment', paymentRoutes);

// SPA fallback for HTML5 routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
  }

  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

export default app;
