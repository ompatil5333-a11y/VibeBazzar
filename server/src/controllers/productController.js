import { pool } from '../config/db.js';
import {
  productsData,
  categoriesData,
  bannersData,
  testimonialsData,
  blogsData
} from '../data/initialData.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, filter, limit } = req.query;

    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];
      let pIdx = 1;

      if (category && category !== 'all') {
        query += ` AND LOWER(category) = LOWER($${pIdx++})`;
        params.push(category);
      }

      if (search) {
        query += ` AND (LOWER(title) LIKE $${pIdx} OR LOWER(description) LIKE $${pIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        pIdx++;
      }

      if (filter === 'trending') query += ' AND is_trending = true';
      if (filter === 'new') query += ' AND is_new = true';
      if (filter === 'top_rated') query += ' AND is_top_rated = true';
      if (filter === 'deal_of_day') query += ' AND is_deal_of_day = true';

      query += ' ORDER BY id ASC';

      if (limit) {
        query += ` LIMIT $${pIdx++}`;
        params.push(parseInt(limit, 10));
      }

      const dbRes = await pool.query(query, params);
      if (dbRes.rows && dbRes.rows.length > 0) {
        const formatted = dbRes.rows.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          badge: r.badge,
          price: parseFloat(r.price),
          originalPrice: r.original_price ? parseFloat(r.original_price) : null,
          rating: parseFloat(r.rating || 5),
          ratingCount: r.rating_count,
          stock: r.stock,
          sold: r.sold,
          imageDefault: r.image_default,
          imageHover: r.image_hover,
          isNew: r.is_new,
          isTrending: r.is_trending,
          isTopRated: r.is_top_rated,
          isDealOfDay: r.is_deal_of_day,
          description: r.description
        }));

        return res.json({
          success: true,
          count: formatted.length,
          dataSource: 'supabase_postgresql',
          data: formatted
        });
      }
    } catch (dbErr) {
      console.warn('PostgreSQL query error, using seed fallback:', dbErr.message);
    }

    // In-memory fallback
    let results = [...productsData];
    if (category && category !== 'all') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }
    if (filter === 'trending') results = results.filter((p) => p.isTrending);
    if (filter === 'new') results = results.filter((p) => p.isNew);
    if (filter === 'top_rated') results = results.filter((p) => p.isTopRated);
    if (filter === 'deal_of_day') results = results.filter((p) => p.isDealOfDay);
    if (limit) results = results.slice(0, parseInt(limit, 10));

    return res.json({
      success: true,
      count: results.length,
      dataSource: 'in-memory',
      data: results
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    try {
      const dbRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (dbRes.rows.length > 0) {
        const r = dbRes.rows[0];
        return res.json({
          success: true,
          data: {
            id: r.id,
            title: r.title,
            category: r.category,
            badge: r.badge,
            price: parseFloat(r.price),
            originalPrice: r.original_price ? parseFloat(r.original_price) : null,
            rating: parseFloat(r.rating || 5),
            ratingCount: r.rating_count,
            stock: r.stock,
            sold: r.sold,
            imageDefault: r.image_default,
            imageHover: r.image_hover,
            isNew: r.is_new,
            isTrending: r.is_trending,
            isTopRated: r.is_top_rated,
            isDealOfDay: r.is_deal_of_day,
            description: r.description
          }
        });
      }
    } catch (dbErr) {
      console.warn('DB error on getProductById:', dbErr.message);
    }

    const product = productsData.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    try {
      const dbRes = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      if (dbRes.rows.length > 0) {
        const cats = dbRes.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          icon: r.icon,
          count: r.item_count
        }));
        return res.json({ success: true, count: cats.length, data: cats });
      }
    } catch (dbErr) {
      console.warn('DB error on getCategories:', dbErr.message);
    }

    return res.json({ success: true, count: categoriesData.length, data: categoriesData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBanners = async (req, res) => {
  try {
    try {
      const dbRes = await pool.query('SELECT * FROM banners ORDER BY id ASC');
      if (dbRes.rows.length > 0) {
        return res.json({ success: true, data: dbRes.rows });
      }
    } catch {}

    return res.json({ success: true, data: bannersData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTestimonials = async (req, res) => {
  try {
    try {
      const dbRes = await pool.query('SELECT * FROM testimonials ORDER BY id ASC');
      if (dbRes.rows.length > 0) return res.json({ success: true, data: dbRes.rows });
    } catch {}

    return res.json({ success: true, data: testimonialsData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    try {
      const dbRes = await pool.query('SELECT * FROM blogs ORDER BY id ASC');
      if (dbRes.rows.length > 0) return res.json({ success: true, data: dbRes.rows });
    } catch {}

    return res.json({ success: true, data: blogsData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
