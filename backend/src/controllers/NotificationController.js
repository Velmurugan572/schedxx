// ==========================================
// Notification Controller (NotificationController.js)
// Extracts user context and processes responses
// ==========================================

import NotificationService from '../services/NotificationService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getNotifications = catchAsync(async (req, res) => {
  const result = await NotificationService.getUserNotifications(req.user.id);
  sendSuccess(res, result, 200, 'User notifications retrieved successfully.');
});

export const markAsRead = catchAsync(async (req, res) => {
  const result = await NotificationService.markAsRead(req.params.id, req.user.id);
  sendSuccess(res, result, 200, 'Notification marked as read successfully.');
});

export const markAllAsRead = catchAsync(async (req, res) => {
  await NotificationService.markAllAsRead(req.user.id);
  sendSuccess(res, null, 200, 'All notifications marked as read successfully.');
});

export const deleteNotification = catchAsync(async (req, res) => {
  await NotificationService.deleteNotification(req.params.id, req.user.id);
  sendSuccess(res, null, 200, 'Notification deleted successfully.');
});

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
