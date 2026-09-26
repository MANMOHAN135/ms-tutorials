import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getProfile, getChildren } from '../controllers/parentController.js';

const router = Router();

/**
 * GET /api/v1/parent/profile
 * Protected parent profile endpoint.
 */
router.get('/profile', requireAuth, requireRole('parent'), getProfile);

/**
 * GET /api/v1/parent/children
 * Protected parent linked children endpoint.
 */
router.get('/children', requireAuth, requireRole('parent'), getChildren);

export default router;
