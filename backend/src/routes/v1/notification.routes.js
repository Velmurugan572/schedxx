// =====================================================================
// User Notification Router Group (notification.routes.js)
// =====================================================================

import express from 'express';
import NotificationController from '../../controllers/NotificationController.js';
import protect from '../../middleware/auth.middleware.js';
import { validateNotificationIdParam } from '../../validators/notification.validator.js';

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(protect);

// Endpoint to retrieve user notifications
router.get('/', NotificationController.getNotifications);

// Endpoint to mark all user notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Endpoint to mark a single notification as read
router.patch('/:id/read', validateNotificationIdParam, NotificationController.markAsRead);

// Endpoint to soft-delete a notification
router.delete('/:id', validateNotificationIdParam, NotificationController.deleteNotification);

export default router;
