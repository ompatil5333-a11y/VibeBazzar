import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST || 'db.maquznfqgsyjkxxrcrjx.supabase.co',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log('✅ PostgreSQL Supabase connected successfully:', res.rows[0]);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    return false;
  }
};
