import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import {
  productsData,
  categoriesData,
  bannersData,
  testimonialsData,
  blogsData
} from '../data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  console.log('🔄 Running Vibe Bazzar PostgreSQL Migrations for Users, Cart & Products...');

  const schemaPath = path.resolve(__dirname, '../../schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('✅ Tables created/verified: users, user_cart, categories, products, orders, etc.');

    // Seed categories if empty
    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      for (const cat of categoriesData) {
        await pool.query(
          'INSERT INTO categories (id, name, slug, icon, item_count) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [cat.id, cat.name, cat.slug, cat.icon, cat.count]
        );
      }
    }

    // Seed products if empty
    const prodCheck = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCheck.rows[0].count, 10) === 0) {
      for (const p of productsData) {
        await pool.query(
          `INSERT INTO products (
            id, title, category, badge, price, original_price, rating, rating_count,
            stock, sold, image_default, image_hover, is_new, is_trending, is_top_rated,
            is_deal_of_day, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING`,
          [
            p.id, p.title, p.category, p.badge, p.price, p.originalPrice, p.rating,
            p.ratingCount, p.stock, p.sold, p.imageDefault, p.imageHover, p.isNew,
            p.isTrending, p.isTopRated, p.isDealOfDay, p.description
          ]
        );
      }
    }

    console.log('🚀 Supabase migrations for Auth & User Cart completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  }
};

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
