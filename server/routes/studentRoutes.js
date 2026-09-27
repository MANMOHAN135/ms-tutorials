import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getProfile } from '../controllers/studentController.js';
import studentAcademicContextRoutes from './studentAcademicContextRoutes.js';
import studentResourceRoutes from './studentResourceRoutes.js';

const router = Router();

/**
 * GET /api/v1/student/profile
 * Protected student profile endpoint.
 */
router.get('/profile', requireAuth, requireRole('student'), getProfile);

// Protected Academic Context Route (Phase 5.8C)
router.use('/', studentAcademicContextRoutes);

// Protected Learning Resource Routes (Phase 5.8D)
router.use('/', studentResourceRoutes);

export default router;
