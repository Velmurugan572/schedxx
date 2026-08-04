// ==========================================
// Analytics Input Validators (analytics.validator.js)
// Validates parameters for analytics synchronization
// ==========================================

import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateSyncAnalytics = [
  body('destinationId')
    .notEmpty().withMessage('Destination ID is required.')
    .isUUID().withMessage('Destination ID must be a valid UUID.'),
  validateRequest
];

export default {
  validateSyncAnalytics
};
