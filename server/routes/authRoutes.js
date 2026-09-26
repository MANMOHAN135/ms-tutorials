import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';

const router = Router();

// Authentication endpoints (Phase 5.2)
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
