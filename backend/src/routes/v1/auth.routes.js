// ==========================================
// Authentication Routes Mounting (auth.routes.js)
// Registers endpoints for user registration, sessions, and logouts
// ==========================================

import express from 'express';
import AuthController from '../../controllers/AuthController.js';
import {
  validateRegister,
  validateLogin,
  validateRefresh
} from '../../validators/auth.validator.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh', validateRefresh, AuthController.refresh);
router.post('/logout', validateRefresh, AuthController.logout);

export default router;
