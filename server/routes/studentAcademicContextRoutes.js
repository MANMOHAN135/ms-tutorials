import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { getAcademicContext } from '../controllers/studentAcademicContextController.js';

const router = Router();

/**
 * Protected Student Academic Context Endpoint (Phase 5.8C)
 * Restricted to authenticated students only.
 * Identity is derived strictly from req.user.id.
 */
router.get('/academic-context', requireAuth, requireRole('student'), getAcademicContext);

export default router;
