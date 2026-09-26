import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getNodes,
  getNodeById,
  getNodeChapters,
  getChapter,
  getChapterTopics,
  getTopic,
} from '../controllers/curriculumController.js';

const router = Router();

const ALLOWED_ROLES = ['student', 'parent', 'teacher', 'admin'];

/**
 * Protected Read-Only Curriculum Routes (Phase 5.8B)
 * Accessible by all authenticated roles: student, parent, teacher, admin.
 */
router.get('/nodes', requireAuth, requireRole(...ALLOWED_ROLES), getNodes);
router.get('/nodes/:id', requireAuth, requireRole(...ALLOWED_ROLES), getNodeById);
router.get('/nodes/:id/chapters', requireAuth, requireRole(...ALLOWED_ROLES), getNodeChapters);

router.get('/chapters/:id', requireAuth, requireRole(...ALLOWED_ROLES), getChapter);
router.get('/chapters/:id/topics', requireAuth, requireRole(...ALLOWED_ROLES), getChapterTopics);

router.get('/topics/:id', requireAuth, requireRole(...ALLOWED_ROLES), getTopic);

export default router;
