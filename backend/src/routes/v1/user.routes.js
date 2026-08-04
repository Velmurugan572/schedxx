// ==========================================
// User Route Group Configuration (user.routes.js)
// Endpoints for managing user profiles
// ==========================================

import express from 'express';
import UserController from '../../controllers/UserController.js';
import protect from '../../middleware/auth.middleware.js';

const router = express.Router();

// Protected profile route
router.get('/me', protect, UserController.getMe);

export default router;
