// ==========================================
// API Server Runtime Listener Entrypoint
// ==========================================

import app from './app.js';
import { env } from './config/env.js';
import { logger } from './logger/index.js';

import { prisma } from './database/prisma.js';
import { redis } from './config/redis.js';
import { publisherWorker } from './jobs/workers/PublisherWorker.js';
import { schedulerQueue } from './jobs/queues/scheduler.queue.js';

// Bind web server listener
const server = app.listen(env.port, () => {
  logger.info('===============================================');
  logger.info(`  Sched Server booted successfully in [${env.nodeEnv}]`);
  logger.info(`  Endpoint: http://localhost:${env.port}`);
  logger.info('===============================================');
});

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  // Set a fallback timeout of 10s to force process exit if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit...');
    process.exit(1);
  }, 10000).unref();

  // 1. Stop receiving new HTTP requests
  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      // 2. Close BullMQ workers and queues
      logger.info('Closing background job workers and queues...');
      await publisherWorker.close();
      await schedulerQueue.close();
      logger.info('Background job workers and queues closed.');

      // 3. Disconnect Redis client
      logger.info('Disconnecting Redis...');
      await redis.quit();
      logger.info('Redis client disconnected.');

      // 4. Disconnect Prisma client
      logger.info('Disconnecting Prisma database client...');
      await prisma.$disconnect();
      logger.info('Prisma client disconnected.');

      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    } catch (err) {
      logger.error('Error encountered during graceful shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Intercept unhandled Promise rejections (e.g. DB connection dropped)
process.on('unhandledRejection', (err) => {
  logger.error('CRITICAL UNHANDLED REJECTION DETECTED! Initiating graceful teardown...');
  logger.error(`${err.name}: ${err.message}`);
  
  if (err.stack) {
    logger.error(err.stack);
  }

  // Gracefully stop server before terminating container process
  server.close(() => {
    process.exit(1);
  });
});

// Intercept runtime programming failures
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL UNCAUGHT EXCEPTION DETECTED! Initiating shutdown...');
  logger.error(`${err.name}: ${err.message}`);
  
  if (err.stack) {
    logger.error(err.stack);
  }

  process.exit(1);
});
