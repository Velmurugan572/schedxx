// ==========================================
// Notification Repository (NotificationRepository.js)
// Layer for managing user & workspace notifications
// ==========================================

import prisma from '../database/prisma.js';

export class NotificationRepository {
  /**
   * Creates a new notification record.
   * @param {object} data - Notification fields (workspaceId, userId, title, message, type)
   * @returns {Promise<object>} Created notification
   */
  async create(data) {
    return prisma.notification.create({
      data: {
        workspaceId: data.workspaceId || null,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        isRead: false
      }
    });
  }

  /**
   * Retrieves all non-deleted notifications for a specific user.
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} List of notifications
   */
  async findByUserId(userId) {
    return prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Finds a single non-deleted notification by ID and user.
   * @param {string} id - Notification UUID
   * @param {string} userId - Owner User UUID
   * @returns {Promise<object|null>} Notification or null
   */
  async findByIdAndUser(id, userId) {
    return prisma.notification.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });
  }

  /**
   * Updates notification attributes (e.g., mark as read, soft delete).
   * @param {string} id - Notification UUID
   * @param {object} data - Fields to update
   * @returns {Promise<object>} Updated notification
   */
  async update(id, data) {
    return prisma.notification.update({
      where: { id },
      data
    });
  }

  /**
   * Marks all unread notifications for a user as read.
   * @param {string} userId - User UUID
   * @returns {Promise<object>} Prisma batch payload result
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }
}

export default new NotificationRepository();
