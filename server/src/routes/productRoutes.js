import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBanners,
  getTestimonials,
  getBlogs
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.get('/categories', getCategories);
router.get('/banners', getBanners);
router.get('/testimonials', getTestimonials);
router.get('/blogs', getBlogs);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
