import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path'

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/courses.routes.js';
import enrollmentRoutes from './routes/enrollments.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import lessonRoutes from './routes/lessons.routes.js'
import progressRoutes from './routes/progress.routes.js'
import userRoutes from './routes/users.routes.js'
import uploadsRoutes from './routes/uploads.routes.js'
import healthRoutes from './routes/health.routes.js'



const app = express();

// Security + basics
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173']),
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limit auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/v1/auth', authLimiter);

// Health check
app.get('/healthz', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// serve uploaded files
app.use('/uploads', express.static(path.resolve('uploads')))

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/uploads', uploadsRoutes)
app.use('/api/v1/health', healthRoutes)

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

export default app;
