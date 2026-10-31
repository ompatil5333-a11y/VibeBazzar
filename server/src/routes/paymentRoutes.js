import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentConfig
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Backwards-compatible /create-intent
router.post('/create-intent', createRazorpayOrder);

export default router;
