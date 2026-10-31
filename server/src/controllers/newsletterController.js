import { pool } from '../config/db.js';

let fallbackSubscribers = new Set();

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await pool.query(
        'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
        [normalizedEmail]
      );
      console.log(`✅ Newsletter subscriber ${normalizedEmail} recorded in Supabase PostgreSQL.`);

      return res.status(201).json({
        success: true,
        message: 'Thank you for subscribing to Anon updates!',
        email: normalizedEmail
      });
    } catch (dbErr) {
      if (dbErr.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'This email is already subscribed!'
        });
      }
      console.warn('DB error on subscribeNewsletter:', dbErr.message);
    }

    if (fallbackSubscribers.has(normalizedEmail)) {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed!'
      });
    }

    fallbackSubscribers.add(normalizedEmail);

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to Anon updates!',
      email: normalizedEmail
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
