import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'MS Tutorials Backend API',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`MS Tutorials server running on http://localhost:${config.port}`);
  });
}

export default app;
