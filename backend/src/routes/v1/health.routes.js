// =====================================================================
// Diagnostic Health Check Route (health.routes.js)
// =====================================================================

import express from 'express';
import { prisma } from '../../database/prisma.js';
import { redis } from '../../config/redis.js';
import { sendSuccess } from '../../utils/response.js';
import { env } from '../../config/env.js';
import { logger } from '../../logger/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let dbStatus = 'UP';
  let redisStatus = 'UP';
  let isHealthy = true;

  // 1. Verify PostgreSQL Database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'DOWN';
    isHealthy = false;
    logger.error(`Healthcheck Database Failure: ${error.message}`);
  }

  // 2. Verify Redis connection status and responsiveness
  try {
    // Check ready state or send a ping
    if (redis.status !== 'ready' && redis.status !== 'connect') {
      redisStatus = 'DOWN';
      isHealthy = false;
    } else {
      const pingResult = await redis.ping();
      if (pingResult !== 'PONG') {
        redisStatus = 'DOWN';
        isHealthy = false;
      }
    }
  } catch (error) {
    redisStatus = 'DOWN';
    isHealthy = false;
    logger.error(`Healthcheck Redis Failure: ${error.message}`);
  }

  const healthData = {
    status: isHealthy ? 'UP' : 'DOWN',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.nodeEnv,
    services: {
      database: dbStatus,
      cache: redisStatus
    }
  };

  if (isHealthy) {
    return sendSuccess(res, healthData, 200, 'System is healthy');
  } else {
    // Return 503 Service Unavailable if any service check fails
    return res.status(503).json({
      success: false,
      message: 'System is unhealthy',
      data: healthData
    });
  }
});

export default router;
