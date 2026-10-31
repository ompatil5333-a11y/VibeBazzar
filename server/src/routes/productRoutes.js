import express from 'express';
import {
  getAllProducts,
  getProductById,
  getCategories,
  getBanners,
  getTestimonials,
  getBlogs
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/banners', getBanners);
router.get('/testimonials', getTestimonials);
router.get('/blogs', getBlogs);
router.get('/:id', getProductById);

export default router;
