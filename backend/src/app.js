// ==========================================
// Central Express Application Bootstrapper (app.js)
// ==========================================

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env.js';
import { rateLimit } from 'express-rate-limit';
import { logger } from './logger/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './errors/AppError.js';
import rootRouter from './routes/index.js';
import { initJobs } from './jobs/index.js';
import './config/redis.js';

const app = express();

// 1. Enforce Web Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: env.nodeEnv === 'production',
  crossOriginEmbedderPolicy: env.nodeEnv === 'production'
}));

// 2. Configure Cross-Origin Resource Sharing (CORS) with origin checks
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, system calls, or testing tools)
    if (!origin) return callback(null, true);
    if (env.allowedOrigins.includes('*') || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError('Not allowed by CORS', 403));
  },
  credentials: true
};
app.use(cors(corsOptions));

// 2b. Mount Rate Limiting middleware for DDoS mitigation
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  skip: () => env.nodeEnv === 'test'
});
app.use(limiter);

// 3. Compress payloads (optimizes mobile bandwidth consumption)
app.use(compression());

// 4. Parse payload formats
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Morgan Logger mapping to Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// 6. Register Master Versioned Routing Tree
app.use(rootRouter);

// 6b. Initialize background jobs once for the application lifecycle
await initJobs();

// 7. Standard 404 Route Intercept
app.all('*', (req, res, next) => {
  next(new AppError(`Endpoint [${req.originalUrl}] not found on this server.`, 404));
});

// 8. Global Error Handler middleware (must be registered last)
app.use(errorHandler);

export default app;
