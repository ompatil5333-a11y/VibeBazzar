import express from 'express';
import { executeAdminQuery, getAdminStats } from '../controllers/adminController.js';

const router = express.Router();

router.post('/query', executeAdminQuery);
router.get('/stats', getAdminStats);

export default router;
