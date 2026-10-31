import { pool } from '../config/db.js';

let fallbackOrders = [
  {
    id: 'ORD-1730000000000-842',
    userId: 1,
    customerName: 'Om Patil',
    customerEmail: 'ompatil@example.com',
    customerPhone: '+91 9876543210',
    shippingAddress: 'Flat 402, Apple Court, MG Road, Pune, Maharashtra 411001',
    items: [
      {
        id: 1,
        title: 'Vibe Elite Winter Bomber Leather Jacket',
        quantity: 1,
        price: 2499.00
      }
    ],
    totalAmount: '2499.00',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'accepted',
    adminNotes: 'Verified and packed for priority dispatch.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ORD-1730000000000-319',
    userId: null,
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@example.com',
    customerPhone: '+91 9123456789',
    shippingAddress: 'Villa 12, Palm Meadows, Whitefield, Bengaluru 560066',
    items: [
      {
        id: 7,
        title: 'Vibe Pulse AMOLED Fitness Smartwatch',
        quantity: 1,
        price: 3499.00
      }
    ],
    totalAmount: '3499.00',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    orderStatus: 'pending',
    adminNotes: 'Awaiting warehouse stock verification.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

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
      orderStatus: 'pending', // Defaults to pending until admin accepts
      adminNotes: '',
      createdAt: new Date().toISOString()
    };

    try {
      await pool.query(
        `INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, payment_status, order_status, admin_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
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
          newOrder.orderStatus,
          ''
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
      if (dbRes.rows && dbRes.rows.length > 0) {
        // Fetch items for each order
        const ordersWithItems = await Promise.all(
          dbRes.rows.map(async (o) => {
            try {
              const itemRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
              return {
                id: o.id,
                userId: o.user_id,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                customerPhone: o.customer_phone,
                shippingAddress: o.shipping_address,
                totalAmount: o.total_amount,
                paymentMethod: o.payment_method,
                paymentStatus: o.payment_status,
                orderStatus: o.order_status,
                adminNotes: o.admin_notes || '',
                createdAt: o.created_at,
                items: itemRes.rows.map((i) => ({
                  id: i.product_id,
                  title: i.product_title,
                  quantity: i.quantity,
                  price: parseFloat(i.unit_price)
                }))
              };
            } catch {
              return {
                id: o.id,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                totalAmount: o.total_amount,
                orderStatus: o.order_status,
                adminNotes: o.admin_notes || '',
                createdAt: o.created_at,
                items: []
              };
            }
          })
        );

        return res.json({ success: true, count: ordersWithItems.length, data: ordersWithItems });
      }
    } catch (dbErr) {
      console.warn('DB error on getOrders:', dbErr.message);
    }

    let results = [...fallbackOrders];
    if (userId) {
      results = results.filter((o) => o.userId === parseInt(userId, 10));
    }

    return res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE ORDER STATUS (Accept / Reject / Shipped / Delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Try DB update
    try {
      await pool.query(
        'UPDATE orders SET order_status = $1, admin_notes = COALESCE($2, admin_notes) WHERE id = $3',
        [status, adminNotes || '', id]
      );
    } catch (dbErr) {
      console.warn('DB error on updateOrderStatus:', dbErr.message);
    }

    // Update in-memory fallback
    const orderIdx = fallbackOrders.findIndex((o) => o.id === id);
    if (orderIdx !== -1) {
      fallbackOrders[orderIdx].orderStatus = status;
      if (adminNotes !== undefined) {
        fallbackOrders[orderIdx].adminNotes = adminNotes;
      }
      return res.json({
        success: true,
        message: `Order #${id} status updated to ${status}`,
        order: fallbackOrders[orderIdx]
      });
    }

    return res.json({
      success: true,
      message: `Order #${id} status updated to ${status}`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
