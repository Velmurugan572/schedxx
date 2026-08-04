// ==========================================
// Analytics Repository (AnalyticsRepository.js)
// Layer for managing timeseries metrics in Prisma
// ==========================================

import prisma from '../database/prisma.js';

export class AnalyticsRepository {
  /**
   * Records a new analytics metric point.
   * @param {object} data - Metric parameters (postId, socialAccountId, metricName, metricValue, timestamp)
   * @returns {Promise<object>}
   */
  async createMetric(data) {
    return prisma.analytics.create({
      data: {
        postId: data.postId,
        postDestinationId: data.postDestinationId,
        socialAccountId: data.socialAccountId,
        metricName: data.metricName,
        metricValue: data.metricValue,
        timestamp: data.timestamp || new Date()
      }
    });
  }

  /**
   * Retrieves all metric points registered for a specific post.
   * @param {string} postId - Unique post UUID
   * @returns {Promise<Array>}
   */
  async findByPostId(postId) {
    return prisma.analytics.findMany({
      where: { postId },
      orderBy: { timestamp: 'desc' }
    });
  }

  /**
   * Retrieves all metrics recorded for a workspace.
   * @param {string} workspaceId - Unique workspace UUID
   * @returns {Promise<Array>}
   */
  async findByWorkspaceId(workspaceId) {
    return prisma.analytics.findMany({
      where: {
        socialAccount: {
          integration: {
            workspaceId
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  /**
   * Retrieves chronological historical performance metrics.
   * @param {string} workspaceId - Unique workspace UUID
   * @param {string} [metricName] - Optional filter by metric type (reach, impressions, engagement)
   * @returns {Promise<Array>}
   */
  async findHistoricalMetrics(workspaceId, metricName = null) {
    const where = {
      socialAccount: {
        integration: {
          workspaceId
        }
      }
    };
    
    if (metricName) {
      where.metricName = metricName;
    }

    return prisma.analytics.findMany({
      where,
      orderBy: {
        timestamp: 'asc'
      }
    });
  }
}

export default new AnalyticsRepository();
