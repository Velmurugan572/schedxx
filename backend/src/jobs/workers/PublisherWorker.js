// =====================================================================
// Publisher Worker (PublisherWorker.js)
// BullMQ worker client that triggers dispatches at scheduled times
// =====================================================================

import { Worker } from 'bullmq';
import { env } from '../../config/env.js';
import { QueueName } from '../../types/index.js';
import PublisherService from '../../services/PublisherService.js';
import { logger } from '../../logger/index.js';

export const publisherWorker = new Worker(
  QueueName.PUBLISH,
  async (job) => {
    logger.info(`Processing publishing job ${job.id} for schedule ${job.data.scheduleId}`);
    return PublisherService.publishPost(job.data.scheduleId, job);
  },
  {
    connection: {
      url: env.redisUrl
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
);

publisherWorker.on('failed', (job, err) => {
  logger.error(`Publisher job ${job?.id} failed: ${err.message}`);
});

export default publisherWorker;
