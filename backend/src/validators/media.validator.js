// ==========================================
// Media Input Validators (media.validator.js)
// Validates parameters for Media Engine route operations
// ==========================================

import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateUpload = [
  body('workspaceId').isUUID().withMessage('Workspace ID must be a valid UUID.'),
  validateRequest
];

export const validateListMedia = [
  param('workspaceId').isUUID().withMessage('Workspace ID must be a valid UUID.'),
  validateRequest
];

export const validateDeleteMedia = [
  param('id').isUUID().withMessage('Media Asset ID must be a valid UUID.'),
  validateRequest
];

export const validateAttachment = [
  body('postId').isUUID().withMessage('Post ID must be a valid UUID.'),
  body('mediaAssetId').isUUID().withMessage('Media Asset ID must be a valid UUID.'),
  validateRequest
];

export default {
  validateUpload,
  validateListMedia,
  validateDeleteMedia,
  validateAttachment
};
