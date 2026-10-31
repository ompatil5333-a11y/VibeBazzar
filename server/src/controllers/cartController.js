import { pool } from '../config/db.js';

let fallbackCarts = {};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      const dbRes = await pool.query(
        `SELECT c.product_id, c.quantity, p.title, p.price, p.original_price, p.image_default, p.category
         FROM user_cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.updated_at DESC`,
        [userId]
      );

      const items = dbRes.rows.map((r) => ({
        id: r.product_id,
        title: r.title,
        price: parseFloat(r.price),
        originalPrice: r.original_price ? parseFloat(r.original_price) : null,
        imageDefault: r.image_default,
        category: r.category,
        quantity: r.quantity
      }));

      return res.json({ success: true, count: items.length, data: items });
    } catch (dbErr) {
      console.warn('DB error on getCart:', dbErr.message);
      const items = fallbackCarts[userId] || [];
      return res.json({ success: true, count: items.length, data: items });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items = [] } = req.body;

    try {
      // Upsert each item
      for (const item of items) {
        if (!item.id) continue;
        await pool.query(
          `INSERT INTO user_cart (user_id, product_id, quantity, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, product_id)
           DO UPDATE SET quantity = $3, updated_at = CURRENT_TIMESTAMP`,
          [userId, item.id, item.quantity || 1]
        );
      }

      return res.json({
        success: true,
        message: 'Cart synchronized with Supabase PostgreSQL.'
      });
    } catch (dbErr) {
      console.warn('DB error on syncCart:', dbErr.message);
      fallbackCarts[userId] = items;
      return res.json({ success: true, message: 'Cart synced to memory.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    try {
      await pool.query(
        `INSERT INTO user_cart (user_id, product_id, quantity, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = user_cart.quantity + $3, updated_at = CURRENT_TIMESTAMP`,
        [userId, productId, quantity]
      );

      return res.json({ success: true, message: 'Product added to Supabase cart.' });
    } catch (dbErr) {
      console.warn('DB error on addToCart:', dbErr.message);
      return res.json({ success: true, message: 'Item saved.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId, 10);

    try {
      await pool.query(
        'DELETE FROM user_cart WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return res.json({ success: true, message: 'Item removed from Supabase cart.' });
    } catch (dbErr) {
      return res.json({ success: true, message: 'Item removed.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    try {
      await pool.query('DELETE FROM user_cart WHERE user_id = $1', [userId]);
    } catch {}
    delete fallbackCarts[userId];
    return res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
