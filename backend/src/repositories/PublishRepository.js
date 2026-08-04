// ==========================================
// Publish Repository (PublishRepository.js)
// Layer for managing publishing state transitions
// ==========================================

import prisma from '../database/prisma.js';

export class PublishRepository {
  /**
   * Retrieves a schedule with its associated post, social account, and platform integration.
   * @param {string} scheduleId - Unique schedule UUID
   * @returns {Promise<object>}
   */
  async findById(scheduleId) {
    return prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        deletedAt: null
      },
      include: {
        post: true,
        socialAccount: {
          include: {
            integration: {
              include: {
                platform: true
              }
            }
          }
        },
        destinations: true
      }
    });
  }

  /**
   * Updates the status of a specific post destination channel.
   * @param {string} destinationId - Unique destination UUID
   * @param {string} status - New PublishStatus (PENDING, PUBLISHING, PUBLISHED, FAILED)
   * @param {object} [extraData] - Additional payload metadata (externalItemId, externalItemUrl, errorMessage)
   * @returns {Promise<object>}
   */
  async updateDestinationStatus(destinationId, status, extraData = {}) {
    return prisma.postDestination.update({
      where: { id: destinationId },
      data: {
        status,
        externalItemId: extraData.externalItemId || null,
        externalItemUrl: extraData.externalItemUrl || null,
        errorMessage: extraData.errorMessage || null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    });
  }

  /**
   * Updates the status of a schedule.
   * @param {string} scheduleId - Unique schedule UUID
   * @param {string} status - New ScheduleStatus (PENDING, RUNNING, COMPLETED, FAILED, CANCELLED)
   * @returns {Promise<object>}
   */
  async updateScheduleStatus(scheduleId, status) {
    return prisma.schedule.update({
      where: { id: scheduleId },
      data: { status }
    });
  }

  /**
   * Updates the status of the parent Post.
   * @param {string} postId - Unique post UUID
   * @param {string} status - New PostStatus (DRAFT, SCHEDULED, PUBLISHING, PUBLISHED, FAILED)
   * @returns {Promise<object>}
   */
  async updatePostStatus(postId, status) {
    return prisma.post.update({
      where: { id: postId },
      data: { status }
    });
  }

  /**
   * Retrieves a destination with its associated post, social account, and integration.
   * @param {string} destinationId - Unique destination UUID
   * @returns {Promise<object>}
   */
  async findDestinationById(destinationId) {
    return prisma.postDestination.findFirst({
      where: {
        id: destinationId,
        deletedAt: null
      },
      include: {
        post: true,
        socialAccount: {
          include: {
            integration: {
              include: {
                platform: true
              }
            }
          }
        }
      }
    });
  }
}

export default new PublishRepository();
