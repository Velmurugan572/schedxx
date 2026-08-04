import { Queue } from 'bullmq';
import { env } from '../../config/env.js';
import { QueueName } from '../../types/index.js';

export const schedulerQueue = new Queue(QueueName.PUBLISH, {
  connection: {
    url: env.redisUrl
  }
});

export default schedulerQueue;
