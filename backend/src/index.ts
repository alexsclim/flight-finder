import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search';
import alertRoutes from './routes/alerts';
import authRoutes from './routes/auth';
import { startAlertMatcher } from './jobs/alertMatcher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Award Seat Alerts API running on http://localhost:${PORT}`);
  console.log('📡 Starting alert matcher background job...');
  startAlertMatcher();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
