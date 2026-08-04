// ==========================================
// Authentication Input Validators (auth.validator.js)
// Validation constraints using express-validator
// ==========================================

import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.js';

export const validateRegister = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('firstName')
    .notEmpty().withMessage('First name is required.')
    .trim()
    .escape(),
  body('lastName')
    .notEmpty().withMessage('Last name is required.')
    .trim()
    .escape(),
  validateRequest
];

export const validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
  validateRequest
];

export const validateRefresh = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required.'),
  validateRequest
];
