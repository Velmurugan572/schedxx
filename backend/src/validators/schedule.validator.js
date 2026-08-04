import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateCreateSchedule = [
  body('workspaceId').notEmpty().withMessage('Workspace ID is required.').isUUID().withMessage('Workspace ID must be a valid UUID.'),
  body('postId').notEmpty().withMessage('Post ID is required.').isUUID().withMessage('Post ID must be a valid UUID.'),
  body('socialAccountId').notEmpty().withMessage('Social account ID is required.').isUUID().withMessage('Social account ID must be a valid UUID.'),
  body('scheduledAt').notEmpty().withMessage('Scheduled time is required.').isISO8601().withMessage('Scheduled time must be a valid ISO 8601 date.'),
  validateRequest
];
