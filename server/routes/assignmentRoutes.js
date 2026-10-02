import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  createAssignment,
  getAssignments,
  getAssignmentDetail,
  publishAssignment,
  getAssignmentSubmissions,
  evaluateSubmission,
} from '../controllers/assignmentController.js';

const router = Router();

/**
 * Protected Assignment & Evaluation Management Routes (Phase 5.10E-B)
 * Restricted to authenticated faculty (teachers) and administrators.
 */

// Master Assignment Creation & Listing
router.post('/', requireAuth, requireRole('teacher', 'admin'), createAssignment);
router.get('/', requireAuth, requireRole('teacher', 'admin'), getAssignments);
router.get('/:id', requireAuth, requireRole('teacher', 'admin'), getAssignmentDetail);

// Publication & Target Materialization Fanout
router.post('/:id/publish', requireAuth, requireRole('teacher', 'admin'), publishAssignment);

// Submission Queue for Assignment
router.get('/:id/submissions', requireAuth, requireRole('teacher', 'admin'), getAssignmentSubmissions);

// Precise Submission-Scoped Evaluation
router.post('/submissions/:submissionId/evaluate', requireAuth, requireRole('teacher', 'admin'), evaluateSubmission);

// Contextual Assignment-Scoped Evaluation Alias
router.post('/:id/evaluate', requireAuth, requireRole('teacher', 'admin'), (req, res, next) => {
  // If submissionId is in body or param, map to evaluateSubmission
  if (req.body?.submissionId) {
    req.params.submissionId = req.body.submissionId;
  }
  return evaluateSubmission(req, res, next);
});

export default router;
