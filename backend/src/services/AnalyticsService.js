// ==========================================
// Analytics Service (AnalyticsService.js)
// Orchestrates retrieval, storage, and retrieval of metrics
// ==========================================

import PublishRepository from '../repositories/PublishRepository.js';
import PostRepository from '../repositories/PostRepository.js';
import AnalyticsRepository from '../repositories/AnalyticsRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import ConnectorFactory from '../connectors/factory/ConnectorFactory.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../logger/index.js';

export class AnalyticsService {
  /**
   * Fetches latest metrics from the resolved platform connector and records them in the database.
   * @param {string} destinationId - Unique destination UUID
   * @param {string} userId - User requesting synchronization
   * @returns {Promise<Array>} List of saved metric records
   */
  async fetchAndStoreAnalytics(destinationId, userId) {
    // 1. Resolve destination with platform integrations via Repository
    const destination = await PublishRepository.findDestinationById(destinationId);

    if (!destination) {
      throw new AppError('Post destination not found.', 404);
    }

    // 2. Authorize workspace membership
    const workspaceId = destination.post.workspaceId;
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    const socialAccount = destination.socialAccount;
    const integration = socialAccount.integration;
    if (!integration) {
      throw new AppError(`No integration credentials found for social account ${socialAccount.id}.`, 400);
    }

    const platformCode = integration.platform?.code || 'X';
    const upperPlatform = platformCode.toUpperCase();

    // 3. Resolve platform connector adapter from SDK factory
    const connector = ConnectorFactory.get(upperPlatform);

    // 4. Fetch metrics from the external platform connector (mocked execution)
    const targetId = destination.externalItemId || destination.id;
    const rawMetrics = await connector.analytics(targetId, { accessToken: integration.accessToken });

    // 5. Store retrieved metric points in database
    const savedMetrics = [];
    for (const metric of rawMetrics) {
      const storedMetric = await AnalyticsRepository.createMetric({
        postId: destination.postId,
        postDestinationId: destination.id,
        socialAccountId: destination.socialAccountId,
        metricName: metric.name,
        metricValue: metric.value,
        timestamp: new Date()
      });
      savedMetrics.push(storedMetric);
    }

    logger.info(`Successfully synchronized ${savedMetrics.length} analytics metrics for destination ${destinationId}`);
    return savedMetrics;
  }

  /**
   * Retrieves analytics metric points recorded for a specific post.
   * @param {string} postId - Unique post UUID
   * @param {string} userId - User requesting metrics
   * @returns {Promise<Array>}
   */
  async getPostAnalytics(postId, userId) {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(post.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return AnalyticsRepository.findByPostId(postId);
  }

  /**
   * Retrieves all metric points recorded for a workspace.
   * @param {string} workspaceId - Unique workspace UUID
   * @param {string} userId - User requesting metrics
   * @returns {Promise<Array>}
   */
  async getWorkspaceAnalytics(workspaceId, userId) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return AnalyticsRepository.findByWorkspaceId(workspaceId);
  }

  /**
   * Retrieves chronological historical performance metrics for a workspace.
   * @param {string} workspaceId - Unique workspace UUID
   * @param {string} userId - User requesting historical stats
   * @param {string} [metricName] - Optional filter by metric type (reach, impressions, engagement)
   * @returns {Promise<Array>}
   */
  async getHistoricalAnalytics(workspaceId, userId, metricName = null) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return AnalyticsRepository.findHistoricalMetrics(workspaceId, metricName);
  }
}

export default new AnalyticsService();
