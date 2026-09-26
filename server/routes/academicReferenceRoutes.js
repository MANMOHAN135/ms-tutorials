import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getSessions,
  getBoards,
  getClasses,
  getPrograms,
  getSubjects,
} from '../controllers/academicReferenceController.js';

const router = Router();

const ALLOWED_ROLES = ['student', 'parent', 'teacher', 'admin'];

/**
 * Protected Academic Reference Endpoints (Phase 5.8A)
 * Accessible by all authenticated roles: student, parent, teacher, admin.
 */
router.get('/sessions', requireAuth, requireRole(...ALLOWED_ROLES), getSessions);
router.get('/boards', requireAuth, requireRole(...ALLOWED_ROLES), getBoards);
router.get('/classes', requireAuth, requireRole(...ALLOWED_ROLES), getClasses);
router.get('/programs', requireAuth, requireRole(...ALLOWED_ROLES), getPrograms);
router.get('/subjects', requireAuth, requireRole(...ALLOWED_ROLES), getSubjects);

export default router;
