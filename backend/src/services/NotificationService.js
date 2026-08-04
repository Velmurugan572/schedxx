// ==========================================
// Notification Service (NotificationService.js)
// Layer coordinating notification CRUD and read updates
// ==========================================

import NotificationRepository from '../repositories/NotificationRepository.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../logger/index.js';

export class NotificationService {
  /**
   * Internal mechanism to dispatch system notifications.
   * @param {object} data - Notification fields (workspaceId, userId, title, message, type)
   * @returns {Promise<object>} Created notification record
   */
  async createNotification(data) {
    logger.info(`Dispatching notification for user ${data.userId}: [${data.type}] ${data.title}`);
    return NotificationRepository.create(data);
  }

  /**
   * Retrieves notifications belonging to a specific user.
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} List of notifications
   */
  async getUserNotifications(userId) {
    return NotificationRepository.findByUserId(userId);
  }

  /**
   * Marks a notification as read.
   * @param {string} notificationId - Notification UUID
   * @param {string} userId - Requesting User UUID
   * @returns {Promise<object>} Updated notification record
   */
  async markAsRead(notificationId, userId) {
    const notification = await NotificationRepository.findByIdAndUser(notificationId, userId);
    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }
    return NotificationRepository.update(notificationId, {
      isRead: true,
      readAt: new Date()
    });
  }

  /**
   * Marks all unread user notifications as read.
   * @param {string} userId - User UUID
   * @returns {Promise<object>} Batch update payload result
   */
  async markAllAsRead(userId) {
    return NotificationRepository.markAllAsRead(userId);
  }

  /**
   * Soft-deletes a user notification.
   * @param {string} notificationId - Notification UUID
   * @param {string} userId - Requesting User UUID
   * @returns {Promise<object>} Updated notification record
   */
  async deleteNotification(notificationId, userId) {
    const notification = await NotificationRepository.findByIdAndUser(notificationId, userId);
    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }
    return NotificationRepository.update(notificationId, {
      deletedAt: new Date()
    });
  }
}

export default new NotificationService();
