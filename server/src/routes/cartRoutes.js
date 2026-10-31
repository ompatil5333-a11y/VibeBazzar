import express from 'express';
import {
  getCart,
  syncCart,
  addToCart,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getCart);
router.post('/sync', verifyToken, syncCart);
router.post('/add', verifyToken, addToCart);
router.delete('/:productId', verifyToken, removeFromCart);
router.delete('/', verifyToken, clearCart);

export default router;
