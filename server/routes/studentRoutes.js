import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getProfile } from '../controllers/studentController.js';

const router = Router();

/**
 * GET /api/v1/student/profile
 * Protected student profile endpoint.
 */
router.get('/profile', requireAuth, requireRole('student'), getProfile);

export default router;
