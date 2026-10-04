import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import { checkDatabaseHealth } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import academicReferenceRoutes from './routes/academicReferenceRoutes.js';
import curriculumRoutes from './routes/curriculumRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import { evaluateSubmission } from './controllers/assignmentController.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { requireRole } from './middleware/roleMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Serve static frontend files from Vite build
app.use(express.static(distPath));

// Authentication Routes (Phase 5.2)
app.use('/api/auth', authRoutes);

// Protected Identity & Profile Routes (Phase 5.5)
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/admin', adminRoutes);

// Protected Academic Reference Routes (Phase 5.8A)
app.use('/api/v1/academic', academicReferenceRoutes);

// Protected Curriculum Routes (Phase 5.8B)
app.use('/api/v1/curriculum', curriculumRoutes);

// Protected Assignment & Evaluation Routes (Phase 5.10E-B)
app.use('/api/v1/assignments', assignmentRoutes);
app.post('/api/v1/submissions/:submissionId/evaluate', requireAuth, requireRole('teacher', 'admin'), evaluateSubmission);

// Base Health Check Route
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();

  res.status(200).json({
    status: dbHealth.connected ? 'healthy' : 'operational',
    service: 'MS Tutorials Backend API',
    environment: config.nodeEnv,
    database: {
      connected: dbHealth.connected,
      status: dbHealth.status,
    },
    timestamp: new Date().toISOString(),
  });
});

// React SPA fallback: any non-API route goes to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || config.port || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MS Tutorials server running on port ${PORT}`);
  });
}

export default app;