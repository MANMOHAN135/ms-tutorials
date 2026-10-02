import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getAssignments,
  getAssignmentDetail,
  createSubmission,
  getSubmissions,
} from '../controllers/studentAssignmentController.js';

const router = Router();

/**
 * Protected Student Assignment Routes (Phase 5.10E-B)
 * Restricted to authenticated students only.
 * Student identity is derived strictly from req.user.id.
 */
router.get('/assignments', requireAuth, requireRole('student'), getAssignments);
router.get('/assignments/:id', requireAuth, requireRole('student'), getAssignmentDetail);
router.post('/assignments/:id/submissions', requireAuth, requireRole('student'), createSubmission);
router.get('/assignments/:id/submissions', requireAuth, requireRole('student'), getSubmissions);

export default router;
