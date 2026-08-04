// ==========================================
// Retry Service (RetryService.js)
// Intercepts failures and coordinates BullMQ retries
// ==========================================

import { logger } from '../logger/index.js';
import FailureHandler from './FailureHandler.js';

export class RetryService {
  /**
   * Evaluates job attempts to determine if a retry should occur or if final failure handler should run.
   * @param {object} job - BullMQ job instance
   * @param {Error} error - The thrown exception
   * @param {string} scheduleId - Unique schedule UUID
   * @param {string} destinationId - Unique destination UUID
   * @param {string} postId - Unique post UUID
   */
  async handleRetry(job, error, scheduleId, destinationId, postId) {
    const attemptsMade = job?.attemptsMade || 0;
    const maxAttempts = job?.opts?.attempts || 1;

    if (attemptsMade + 1 < maxAttempts) {
      logger.warn(`Job ${job.id} failed. Attempt ${attemptsMade + 1}/${maxAttempts}. Scheduling retry. Error: ${error.message}`);
      // Rethrow to trigger BullMQ's native retry backoff mechanism
      throw error;
    } else {
      logger.error(`Job ${job.id} exceeded maximum attempts (${maxAttempts}). Invoking final failure handler.`);
      await FailureHandler.handleFailure(scheduleId, destinationId, postId, error);
      throw error;
    }
  }
}

export default new RetryService();
