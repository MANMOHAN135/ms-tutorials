import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getProfile } from '../controllers/teacherController.js';

const router = Router();

/**
 * GET /api/v1/teacher/profile
 * Protected teacher profile endpoint.
 */
router.get('/profile', requireAuth, requireRole('teacher'), getProfile);

export default router;
