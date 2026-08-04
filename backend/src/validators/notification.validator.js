// ==========================================
// Notification Input Validators (notification.validator.js)
// Validates parameters for notification route operations
// ==========================================

import { param } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateNotificationIdParam = [
  param('id').isUUID().withMessage('Notification ID must be a valid UUID.'),
  validateRequest
];

export default {
  validateNotificationIdParam
};
