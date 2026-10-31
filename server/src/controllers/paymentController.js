import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TtQD9j8rwIQeBw';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'IGCs1p9qgaCs2YR7mX2UxLX5';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret
  });
  console.log('✅ Razorpay initialized with test keys:', key_id);
} catch (err) {
  console.warn('⚠️ Razorpay initialization warning:', err.message);
}

// 1. Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required to create a payment order.'
      });
    }

    // Razorpay amount is in smallest currency subunits (paise for INR)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`
    };

    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: key_id,
        receipt: order.receipt
      });
    }

    // Fallback simulation if network issue
    return res.json({
      success: true,
      orderId: `order_sim_${Date.now()}`,
      amount: options.amount,
      currency: options.currency,
      keyId: key_id,
      receipt: options.receipt
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({
      success: false,
      message: err.error?.description || err.message
    });
  }
};

// 2. Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      local_order_id
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing verification attributes.'
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      // Update order in Supabase PostgreSQL
      if (local_order_id) {
        try {
          await pool.query(
            "UPDATE orders SET payment_status = 'paid', payment_method = 'razorpay' WHERE id = $1",
            [local_order_id]
          );
        } catch (dbErr) {
          console.warn('Could not update order status in DB:', dbErr.message);
        }
      }

      return res.json({
        success: true,
        message: 'Razorpay payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature. Payment verification failed.'
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Payment Gateway Configuration details for Frontend
export const getPaymentConfig = (req, res) => {
  return res.json({
    success: true,
    gateway: 'razorpay',
    keyId: key_id,
    currency: 'INR',
    supportedMethods: ['razorpay', 'cash_on_delivery']
  });
};
