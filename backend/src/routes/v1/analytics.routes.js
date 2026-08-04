// =====================================================================
// Workspace Performance Analytics Route Group (analytics.routes.js)
// =====================================================================

import express from 'express';
import AnalyticsController from '../../controllers/AnalyticsController.js';
import protect from '../../middleware/auth.middleware.js';
import { validateSyncAnalytics } from '../../validators/analytics.validator.js';

const router = express.Router();

// Apply auth middleware to all analytics routes
router.use(protect);

// Endpoint to fetch and store latest metrics from connector SDK
router.post('/sync', validateSyncAnalytics, AnalyticsController.syncAnalytics);

// Endpoint to retrieve performance metrics for a specific post
router.get('/posts/:postId', AnalyticsController.getPostAnalytics);

// Endpoint to retrieve all metrics for a workspace
router.get('/workspaces/:workspaceId', AnalyticsController.getWorkspaceAnalytics);

// Endpoint to retrieve chronological historical performance metrics for a workspace
router.get('/workspaces/:workspaceId/history', AnalyticsController.getHistoricalAnalytics);

export default router;
