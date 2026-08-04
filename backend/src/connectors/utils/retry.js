// ==========================================
// Exponential Backoff Retry Helper (retry.js)
// Retries asynchronous operations with jitter
// ==========================================

import { logger } from '../../logger/index.js';

/**
 * Wraps an async function execution with retry logic
 * @param {Function} fn - Async operation callback
 * @param {Object} options - Retry configuration
 * @param {number} options.maxAttempts - Maximum retries (default 3)
 * @param {number} options.delayMs - Initial delay in milliseconds (default 1000)
 * @param {number} options.backoffFactor - Multiplier for each subsequent delay (default 2)
 * @param {Function} options.shouldRetry - Predicate function returning true if error is retriable (default: all errors)
 * @returns {Promise<any>} Response of the callback function
 */
export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffFactor = 2,
    shouldRetry = () => true
  } = options;

  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await fn();
    } catch (error) {
      const isRetriable = shouldRetry(error);
      
      if (attempt >= maxAttempts || !isRetriable) {
        logger.error(`Operation failed permanently after attempt ${attempt}/${maxAttempts}. Error: ${error.message}`);
        throw error;
      }

      const backoffDelay = delayMs * Math.pow(backoffFactor, attempt - 1);
      // Jitter adds +/- 15% random deviation to avoid synchronized retry waves (Thundering Herd)
      const jitter = (Math.random() * 0.3 - 0.15) * backoffDelay;
      const sleepTime = Math.max(0, backoffDelay + jitter);

      logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts}). Retrying in ${Math.round(sleepTime)}ms... Error: ${error.message}`);
      
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    }
  }
}

export default withRetry;
