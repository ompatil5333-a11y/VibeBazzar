import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    isConfigured = true;
    console.log('✅ Supabase client initialized successfully with PostgreSQL connection.');
  } catch (error) {
    console.warn('⚠️ Supabase client initialization error, falling back to in-memory store:', error.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not yet provided in .env - running with in-memory store.');
}

export const getSupabaseClient = () => supabase;
export const isSupabaseConnected = () => isConfigured;
