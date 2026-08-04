// ==========================================
// Publisher Service (PublisherService.js)
// Core engine that dispatches posts via connectors
// ==========================================

import PublishRepository from '../repositories/PublishRepository.js';
import RetryService from './RetryService.js';
import FailureHandler from './FailureHandler.js';
import ConnectorFactory from '../connectors/factory/ConnectorFactory.js';
import { logger } from '../logger/index.js';

export class PublisherService {
  /**
   * Processes a scheduled post dispatch.
   * @param {string} scheduleId - Unique schedule UUID
   * @param {object} [job] - Optional BullMQ job context
   * @returns {Promise<{ success: boolean }>}
   */
  async publishPost(scheduleId, job = null) {
    const schedule = await PublishRepository.findById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found.`);
    }

    if (schedule.status === 'COMPLETED' || schedule.status === 'FAILED') {
      logger.info(`Schedule ${scheduleId} is already in a terminal state (${schedule.status}). Skipping.`);
      return { success: true };
    }

    // 1. Transition schedule status to RUNNING
    await PublishRepository.updateScheduleStatus(scheduleId, 'RUNNING');

    const destinations = schedule.destinations || [];
    if (destinations.length === 0) {
      const error = new Error('No destinations configured for this schedule.');
      if (job) {
        return RetryService.handleRetry(job, error, scheduleId, null, schedule.postId);
      } else {
        await FailureHandler.handleFailure(scheduleId, null, schedule.postId, error);
        throw error;
      }
    }

    // 2. Transition post status to PUBLISHING
    await PublishRepository.updatePostStatus(schedule.postId, 'PUBLISHING');

    const destination = destinations[0];

    try {
      // 3. Transition destination channel status to PUBLISHING
      await PublishRepository.updateDestinationStatus(destination.id, 'PUBLISHING');

      const socialAccount = schedule.socialAccount;
      const integration = socialAccount.integration;
      if (!integration) {
        throw new Error(`No platform integration credentials found for social account ${socialAccount.id}.`);
      }

      const platformCode = integration.platform?.code || 'X';
      const upperPlatform = platformCode.toUpperCase();

      // 4. Validate platform constraints (Integrating AI/Platform Guidelines rules)
      if (upperPlatform === 'X' && schedule.post.content.length > 280) {
        throw new Error('Content exceeds character limit of 280 for X/Twitter.');
      }

      // 5. Resolve connector adapter from Connector Platform SDK
      const connector = ConnectorFactory.get(upperPlatform);

      // 6. Execute publication call (mocked connector implementation)
      const publishResult = await connector.publish(
        { content: schedule.post.content },
        { accessToken: integration.accessToken }
      );

      if (!publishResult || publishResult.success === false) {
        throw new Error(publishResult?.errorMessage || 'Publication request rejected by the platform connector.');
      }

      // 7. Success transition path - update destination records
      await PublishRepository.updateDestinationStatus(destination.id, 'PUBLISHED', {
        externalItemId: publishResult.itemId || 'mock-item-id',
        externalItemUrl: publishResult.url || `https://${platformCode.toLowerCase()}.com/mock-post`
      });

      // 8. Update parent states to final completion
      await PublishRepository.updateScheduleStatus(scheduleId, 'COMPLETED');
      await PublishRepository.updatePostStatus(schedule.postId, 'PUBLISHED');

      // Load updated records to return
      const updatedSchedule = await PublishRepository.findById(scheduleId);
      const updatedDestination = updatedSchedule.destinations.find(d => d.id === destination.id);

      logger.info(`Successfully published schedule ${scheduleId} to destination ${destination.id}`);
      return { success: true, schedule: updatedSchedule, destination: updatedDestination };
    } catch (error) {
      if (job) {
        // Delegate to retry service to increment attempts count and rethrow if needed
        return RetryService.handleRetry(job, error, scheduleId, destination.id, schedule.postId);
      } else {
        // Perform immediate final failure updates if running outside worker queue
        await FailureHandler.handleFailure(scheduleId, destination.id, schedule.postId, error);
        throw error;
      }
    }
  }
}

export default new PublisherService();
