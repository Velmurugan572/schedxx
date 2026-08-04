// ==========================================
// Failure Handler Service (FailureHandler.js)
// Centralized processor for publishing errors
// ==========================================

import PublishRepository from '../repositories/PublishRepository.js';
import PostRepository from '../repositories/PostRepository.js';
import NotificationService from './NotificationService.js';
import { logger } from '../logger/index.js';

export class FailureHandler {
  /**
   * Processes a publication failure, updating database statuses and logging details.
   * @param {string} scheduleId - Unique schedule UUID
   * @param {string} destinationId - Unique destination UUID
   * @param {string} postId - Unique post UUID
   * @param {Error|string} error - The thrown exception or description
   */
  async handleFailure(scheduleId, destinationId, postId, error) {
    const errorMessage = error.message || String(error);
    logger.error(`Publishing failed for schedule ${scheduleId}, destination ${destinationId}: ${errorMessage}`);

    // 1. Mark destination channel status as FAILED and record error message
    if (destinationId) {
      await PublishRepository.updateDestinationStatus(destinationId, 'FAILED', { errorMessage });
    }

    // 2. Mark schedule status as FAILED
    if (scheduleId) {
      await PublishRepository.updateScheduleStatus(scheduleId, 'FAILED');
    }

    // 3. Mark parent post status as FAILED
    if (postId) {
      await PublishRepository.updatePostStatus(postId, 'FAILED');
    }

    // 4. Dispatch system notification to the post's author
    if (postId) {
      try {
        const post = await PostRepository.findById(postId);
        if (post) {
          await NotificationService.createNotification({
            workspaceId: post.workspaceId,
            userId: post.userId,
            title: 'Post Publication Failed',
            message: `Failed to publish post: ${errorMessage}`,
            type: 'ERROR'
          });
        }
      } catch (notifError) {
        logger.error(`Failed to dispatch failure notification: ${notifError.message}`);
      }
    }
  }
}

export default new FailureHandler();
