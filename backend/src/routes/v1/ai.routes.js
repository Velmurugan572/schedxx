// =====================================================================
// AI Content Operations Route Group (ai.routes.js)
// =====================================================================

import express from 'express';
import AIController from '../../controllers/AIController.js';
import protect from '../../middleware/auth.middleware.js';
import { validateGenerateContent } from '../../validators/ai.validator.js';

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(protect);

// Endpoint to generate post captions using AI
router.post('/generate', validateGenerateContent, AIController.generateContent);

// Endpoint to retrieve workspace AI request history logs
router.get('/history/workspace/:workspaceId', AIController.getWorkspaceHistory);

export default router;
