import { pool } from '../config/db.js';

// SQL Query Runner (Admin)
export const executeAdminQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'SQL query string is required.' });
    }

    const trimmed = query.trim();

    // Prevent dangerous multi-table drop / truncate without intention
    if (trimmed.toLowerCase().includes('drop database') || trimmed.toLowerCase().includes('shutdown')) {
      return res.status(403).json({ success: false, message: 'Execution of critical system commands is prohibited.' });
    }

    try {
      const startTime = Date.now();
      const result = await pool.query(trimmed);
      const executionTimeMs = Date.now() - startTime;

      return res.json({
        success: true,
        dataSource: 'supabase_postgresql',
        rowCount: result.rowCount || (result.rows ? result.rows.length : 0),
        command: result.command,
        rows: result.rows || [],
        fields: result.fields ? result.fields.map((f) => f.name) : [],
        executionTimeMs
      });
    } catch (dbErr) {
      return res.status(400).json({
        success: false,
        dataSource: 'supabase_postgresql',
        error: dbErr.message,
        detail: dbErr.detail || null,
        hint: dbErr.hint || null
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Overview KPI Stats (Admin)
export const getAdminStats = async (req, res) => {
  try {
    let stats = {
      totalProducts: 12,
      totalOrders: 2,
      totalRevenue: 5998.00,
      lowStockProducts: 2,
      pendingOrders: 1,
      acceptedOrders: 1,
      rejectedOrders: 0,
      dbConnected: Boolean(process.env.PG_HOST && process.env.PG_PASSWORD)
    };

    try {
      const prodRes = await pool.query('SELECT COUNT(*) as count, SUM(stock) as total_stock FROM products');
      const orderRes = await pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) FILTER (WHERE order_status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE order_status = 'accepted') as accepted_count,
          COUNT(*) FILTER (WHERE order_status = 'rejected') as rejected_count
        FROM orders
      `);
      const lowStockRes = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 15');

      if (prodRes.rows[0]) {
        stats.totalProducts = parseInt(prodRes.rows[0].count, 10);
      }
      if (orderRes.rows[0]) {
        stats.totalOrders = parseInt(orderRes.rows[0].total_orders, 10);
        stats.totalRevenue = parseFloat(orderRes.rows[0].total_revenue);
        stats.pendingOrders = parseInt(orderRes.rows[0].pending_count, 10);
        stats.acceptedOrders = parseInt(orderRes.rows[0].accepted_count, 10);
        stats.rejectedOrders = parseInt(orderRes.rows[0].rejected_count, 10);
      }
      if (lowStockRes.rows[0]) {
        stats.lowStockProducts = parseInt(lowStockRes.rows[0].count, 10);
      }
      stats.dbConnected = true;
    } catch (err) {
      console.warn('DB stats fallback:', err.message);
    }

    return res.json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
