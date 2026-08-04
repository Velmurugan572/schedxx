// ==========================================
// AI Input Validators (ai.validator.js)
// Validates parameters for content generation endpoints
// ==========================================

import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateGenerateContent = [
  body('workspaceId')
    .notEmpty().withMessage('Workspace ID is required.')
    .isUUID().withMessage('Workspace ID must be a valid UUID.'),
  body('prompt')
    .notEmpty().withMessage('Prompt is required.')
    .trim()
    .isLength({ max: 5000 }).withMessage('Prompt cannot exceed 5000 characters.'),
  body('platform')
    .notEmpty().withMessage('Platform is required.')
    .toUpperCase()
    .isIn(['LINKEDIN', 'INSTAGRAM', 'X', 'FACEBOOK']).withMessage('Unsupported social platform.'),
  body('tone')
    .optional()
    .toUpperCase()
    .isIn(['PROFESSIONAL', 'CASUAL', 'HUMOROUS', 'PERSUASIVE']).withMessage('Unsupported tone style.'),
  validateRequest
];

export default {
  validateGenerateContent
};
