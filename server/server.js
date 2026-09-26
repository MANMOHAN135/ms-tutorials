import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import { checkDatabaseHealth } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Authentication Routes (Phase 5.2)
app.use('/api/auth', authRoutes);

// Protected Identity & Profile Routes (Phase 5.5)
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/admin', adminRoutes);

// Base Health Check Route (extended for database connectivity check)
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

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware (sanitized, zero credential leak)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server only if executed directly as the process entrypoint
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  process.argv[1].endsWith('server')
);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`MS Tutorials server running on http://localhost:${config.port}`);
  });
}

export default app;
