// =====================================================================
// Central Task Queues & Workers Registry (index.js)
// =====================================================================

import { logger } from '../logger/index.js';
import '../jobs/queues/scheduler.queue.js';
import '../jobs/workers/PublisherWorker.js';

/**
 * Initializes all system background job queues and worker listeners
 */
export const initJobs = async () => {
  logger.info('Initializing background task queues and workers...');
  logger.info('Background task registrations complete.');
};

export default initJobs;
