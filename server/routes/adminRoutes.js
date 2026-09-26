import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getProfile } from '../controllers/adminController.js';

const router = Router();

/**
 * GET /api/v1/admin/profile
 * Protected admin profile endpoint.
 */
router.get('/profile', requireAuth, requireRole('admin'), getProfile);

export default router;
