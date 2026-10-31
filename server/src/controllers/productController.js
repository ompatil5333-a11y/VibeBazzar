import { pool } from '../config/db.js';
import {
  productsData,
  categoriesData,
  bannersData,
  testimonialsData,
  blogsData
} from '../data/initialData.js';

// In-memory mutable products cache (for offline / fallback mode)
let memoryProducts = productsData.map((p) => ({
  ...p,
  costPrice: p.costPrice || parseFloat((p.price * 0.6).toFixed(2))
}));

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
          costPrice: r.cost_price ? parseFloat(r.cost_price) : parseFloat((r.price * 0.6).toFixed(2)),
          originalPrice: r.original_price ? parseFloat(r.original_price) : null,
          rating: parseFloat(r.rating || 5),
          ratingCount: r.rating_count || 0,
          stock: r.stock !== undefined ? r.stock : 50,
          sold: r.sold || 0,
          imageDefault: r.image_default,
          imageHover: r.image_hover || r.image_default,
          isNew: Boolean(r.is_new),
          isTrending: Boolean(r.is_trending),
          isTopRated: Boolean(r.is_top_rated),
          isDealOfDay: Boolean(r.is_deal_of_day),
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
    let results = [...memoryProducts];
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
            costPrice: r.cost_price ? parseFloat(r.cost_price) : parseFloat((r.price * 0.6).toFixed(2)),
            originalPrice: r.original_price ? parseFloat(r.original_price) : null,
            rating: parseFloat(r.rating || 5),
            ratingCount: r.rating_count || 0,
            stock: r.stock !== undefined ? r.stock : 50,
            sold: r.sold || 0,
            imageDefault: r.image_default,
            imageHover: r.image_hover || r.image_default,
            isNew: Boolean(r.is_new),
            isTrending: Boolean(r.is_trending),
            isTopRated: Boolean(r.is_top_rated),
            isDealOfDay: Boolean(r.is_deal_of_day),
            description: r.description
          }
        });
      }
    } catch (dbErr) {
      console.warn('DB error on getProductById:', dbErr.message);
    }

    const product = memoryProducts.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE Product (Admin)
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      badge,
      price,
      costPrice,
      originalPrice,
      stock = 50,
      imageDefault,
      imageHover,
      isNew = false,
      isTrending = false,
      isTopRated = false,
      isDealOfDay = false,
      description
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and price are required fields.'
      });
    }

    const calculatedCost = costPrice ? parseFloat(costPrice) : parseFloat((price * 0.6).toFixed(2));
    const newId = memoryProducts.length > 0 ? Math.max(...memoryProducts.map((p) => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      title,
      category,
      badge: badge || '',
      price: parseFloat(price),
      costPrice: calculatedCost,
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      rating: 5.0,
      ratingCount: 1,
      stock: parseInt(stock, 10) || 50,
      sold: 0,
      imageDefault: imageDefault || '/assets/images/products/1.jpg',
      imageHover: imageHover || imageDefault || '/assets/images/products/2.jpg',
      isNew: Boolean(isNew),
      isTrending: Boolean(isTrending),
      isTopRated: Boolean(isTopRated),
      isDealOfDay: Boolean(isDealOfDay),
      description: description || ''
    };

    // Try Supabase PostgreSQL Insert
    try {
      const dbRes = await pool.query(
        `INSERT INTO products (
          title, category, badge, price, original_price, cost_price,
          stock, sold, image_default, image_hover, is_new, is_trending,
          is_top_rated, is_deal_of_day, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          newProduct.title,
          newProduct.category,
          newProduct.badge,
          newProduct.price,
          newProduct.originalPrice,
          newProduct.costPrice,
          newProduct.stock,
          0,
          newProduct.imageDefault,
          newProduct.imageHover,
          newProduct.isNew,
          newProduct.isTrending,
          newProduct.isTopRated,
          newProduct.isDealOfDay,
          newProduct.description
        ]
      );
      if (dbRes.rows && dbRes.rows[0]) {
        newProduct.id = dbRes.rows[0].id;
      }
    } catch (dbErr) {
      console.warn('Could not insert product into Supabase, saving in memory:', dbErr.message);
    }

    memoryProducts.unshift(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE Product (Admin)
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    // Try Supabase PostgreSQL Update
    try {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(updates.title); }
      if (updates.category !== undefined) { fields.push(`category = $${idx++}`); values.push(updates.category); }
      if (updates.badge !== undefined) { fields.push(`badge = $${idx++}`); values.push(updates.badge); }
      if (updates.price !== undefined) { fields.push(`price = $${idx++}`); values.push(parseFloat(updates.price)); }
      if (updates.costPrice !== undefined) { fields.push(`cost_price = $${idx++}`); values.push(parseFloat(updates.costPrice)); }
      if (updates.originalPrice !== undefined) { fields.push(`original_price = $${idx++}`); values.push(parseFloat(updates.originalPrice)); }
      if (updates.stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(parseInt(updates.stock, 10)); }
      if (updates.imageDefault !== undefined) { fields.push(`image_default = $${idx++}`); values.push(updates.imageDefault); }
      if (updates.imageHover !== undefined) { fields.push(`image_hover = $${idx++}`); values.push(updates.imageHover); }
      if (updates.isDealOfDay !== undefined) { fields.push(`is_deal_of_day = $${idx++}`); values.push(Boolean(updates.isDealOfDay)); }
      if (updates.isTrending !== undefined) { fields.push(`is_trending = $${idx++}`); values.push(Boolean(updates.isTrending)); }
      if (updates.isNew !== undefined) { fields.push(`is_new = $${idx++}`); values.push(Boolean(updates.isNew)); }
      if (updates.isTopRated !== undefined) { fields.push(`is_top_rated = $${idx++}`); values.push(Boolean(updates.isTopRated)); }
      if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.description); }

      if (fields.length > 0) {
        values.push(id);
        const q = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        await pool.query(q, values);
      }
    } catch (dbErr) {
      console.warn('DB update failed, updating memory product:', dbErr.message);
    }

    // Update in memory cache
    const prodIdx = memoryProducts.findIndex((p) => p.id === id);
    if (prodIdx !== -1) {
      memoryProducts[prodIdx] = {
        ...memoryProducts[prodIdx],
        ...updates,
        price: updates.price !== undefined ? parseFloat(updates.price) : memoryProducts[prodIdx].price,
        costPrice: updates.costPrice !== undefined ? parseFloat(updates.costPrice) : memoryProducts[prodIdx].costPrice,
        stock: updates.stock !== undefined ? parseInt(updates.stock, 10) : memoryProducts[prodIdx].stock
      };
      return res.json({
        success: true,
        message: 'Product updated successfully',
        data: memoryProducts[prodIdx]
      });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: updates
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE Product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
    } catch (dbErr) {
      console.warn('DB delete failed:', dbErr.message);
    }

    memoryProducts = memoryProducts.filter((p) => p.id !== id);

    return res.json({
      success: true,
      message: `Product #${id} deleted successfully`
    });
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
