// ==========================================
// Express Validator Request Handler (validate.js)
// Formats validation errors into standard AppErrors
// ==========================================

import { validationResult } from 'express-validator';
import { AppError } from '../errors/AppError.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error outputs into a clean comma-separated list
    const message = errors.array().map(err => err.msg).join(' | ');
    return next(new AppError(message, 400));
  }
  next();
};

export default validateRequest;
