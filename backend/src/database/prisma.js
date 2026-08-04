// ==========================================
// Centralized Prisma Client Connection Instance (prisma.js)
// Singleton wrapper for database interactions
// ==========================================

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { logger } from '../logger/index.js';

// Setup query logging in development environment
const prismaOptions = {};

if (env.nodeEnv === 'development') {
  prismaOptions.log = [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' }
  ];
}

export const prisma = new PrismaClient(prismaOptions);

// Bind event listeners to direct prisma logs to Winston
if (env.nodeEnv === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Prisma Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
  });

  prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
  });

  prisma.$on('info', (e) => {
    logger.info(`Prisma Info: ${e.message}`);
  });

  prisma.$on('warn', (e) => {
    logger.warn(`Prisma Warn: ${e.message}`);
  });
}

// Graceful disconnection handler on shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting Prisma Client...');
  await prisma.$disconnect();
});

export default prisma;
