// ==========================================
// Post Input Validators (post.validator.js)
// ==========================================

import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateCreatePost = [
  body('workspaceId')
    .notEmpty().withMessage('Workspace ID is required.')
    .isUUID().withMessage('Workspace ID must be a valid UUID.'),
  body('content')
    .notEmpty().withMessage('Post content is required.')
    .trim()
    .isLength({ max: 20000 }).withMessage('Post content cannot exceed 20000 characters.'),
  validateRequest
];

export const validateUpdatePost = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Post title cannot exceed 200 characters.'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 20000 }).withMessage('Post content cannot exceed 20000 characters.'),
  validateRequest
];
