import { pool } from '../config/db.js';

let fallbackOrders = [];

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      totalAmount,
      paymentMethod = 'razorpay'
    } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields: name, email, address, and items are required.'
      });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder = {
      id: orderId,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      shippingAddress,
      items,
      totalAmount: Number(totalAmount).toFixed(2),
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
      orderStatus: 'confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      await pool.query(
        `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, payment_status, order_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newOrder.id,
          newOrder.userId,
          customerName,
          customerEmail,
          customerPhone || '',
          shippingAddress,
          newOrder.totalAmount,
          paymentMethod,
          newOrder.paymentStatus,
          newOrder.orderStatus
        ]
      );

      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, product_title, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newOrder.id,
            item.id || 1,
            item.title,
            item.quantity || 1,
            item.price,
            (item.price * (item.quantity || 1)).toFixed(2)
          ]
        );
      }

      // If user is authenticated, clear their persisted cart
      if (newOrder.userId) {
        try {
          await pool.query('DELETE FROM user_cart WHERE user_id = $1', [newOrder.userId]);
        } catch {}
      }

      console.log(`✅ Order ${newOrder.id} successfully recorded in Supabase PostgreSQL.`);
      return res.status(201).json({
        success: true,
        message: 'Order created successfully in Supabase PostgreSQL',
        order: newOrder
      });
    } catch (dbErr) {
      console.warn('DB error on createOrder, saving to in-memory fallback:', dbErr.message);
    }

    fallbackOrders.unshift(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query;

    try {
      let query = 'SELECT * FROM orders';
      const params = [];
      if (userId) {
        query += ' WHERE user_id = $1';
        params.push(parseInt(userId, 10));
      }
      query += ' ORDER BY created_at DESC';

      const dbRes = await pool.query(query, params);
      return res.json({ success: true, count: dbRes.rows.length, data: dbRes.rows });
    } catch (dbErr) {
      console.warn('DB error on getOrders:', dbErr.message);
    }

    return res.json({ success: true, count: fallbackOrders.length, data: fallbackOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
