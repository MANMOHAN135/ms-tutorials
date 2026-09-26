import { Router } from 'express';
import { login, refresh, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Authentication endpoints (Phase 5.2)
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Identity endpoint protected by authentication gateway (Phase 5.3)
router.get('/me', requireAuth, getMe);

export default router;
