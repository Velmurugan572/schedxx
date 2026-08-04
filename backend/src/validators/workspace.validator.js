// ==========================================
// Workspace Input Validators (workspace.validator.js)
// Validation constraints for workspace modifications and invites
// ==========================================

import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateCreateWorkspace = [
  body('name')
    .notEmpty().withMessage('Workspace name is required.')
    .trim()
    .isLength({ max: 100 }).withMessage('Workspace name cannot exceed 100 characters.'),
  validateRequest
];

export const validateUpdateWorkspace = [
  body('name')
    .notEmpty().withMessage('Workspace name is required.')
    .trim()
    .isLength({ max: 100 }).withMessage('Workspace name cannot exceed 100 characters.'),
  validateRequest
];

export const validateInviteUser = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MEMBER', 'EDITOR']).withMessage('Invalid membership role. Must be ADMIN, MEMBER, or EDITOR.'),
  validateRequest
];
