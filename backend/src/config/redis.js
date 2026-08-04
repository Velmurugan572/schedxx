import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../logger/index.js';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false
});

redis.on('connect', () => logger.info('Redis connection established.'));
redis.on('error', (error) => logger.error(`Redis connection error: ${error.message}`));

export default redis;
