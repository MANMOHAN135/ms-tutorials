import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getResources,
  getResourceById,
} from '../controllers/studentResourceController.js';

const router = Router();

/**
 * Protected Read-Only Student Learning Resource Routes (Phase 5.8D)
 * Restricted to authenticated students only.
 * Identity is derived strictly from req.user.id.
 */
router.get('/resources', requireAuth, requireRole('student'), getResources);
router.get('/resources/:id', requireAuth, requireRole('student'), getResourceById);

export default router;
