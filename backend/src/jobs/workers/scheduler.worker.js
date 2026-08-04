import { Worker } from 'bullmq';
import { env } from '../../config/env.js';
import { QueueName } from '../../types/index.js';
import SchedulingService from '../../services/SchedulingService.js';
import { logger } from '../../logger/index.js';

export const schedulerWorker = new Worker(
  QueueName.PUBLISH,
  async (job) => {
    logger.info(`Processing scheduler job ${job.id}`);
    return SchedulingService.processSchedule(job.data.scheduleId);
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

schedulerWorker.on('failed', (job, err) => {
  logger.error(`Scheduler job ${job?.id} failed: ${err.message}`);
});

export default schedulerWorker;
