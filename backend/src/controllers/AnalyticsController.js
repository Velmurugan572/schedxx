// ==========================================
// Analytics Controller (AnalyticsController.js)
// Extracts request parameters and shapes API responses
// ==========================================

import AnalyticsService from '../services/AnalyticsService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const syncAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsService.fetchAndStoreAnalytics(req.body.destinationId, req.user.id);
  sendSuccess(res, result, 201, 'Analytics metrics synchronized successfully.');
});

export const getPostAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsService.getPostAnalytics(req.params.postId, req.user.id);
  sendSuccess(res, result, 200, 'Post analytics metrics retrieved successfully.');
});

export const getWorkspaceAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsService.getWorkspaceAnalytics(req.params.workspaceId, req.user.id);
  sendSuccess(res, result, 200, 'Workspace analytics metrics retrieved successfully.');
});

export const getHistoricalAnalytics = catchAsync(async (req, res) => {
  const result = await AnalyticsService.getHistoricalAnalytics(
    req.params.workspaceId,
    req.user.id,
    req.query.metricName || null
  );
  sendSuccess(res, result, 200, 'Historical analytics metrics retrieved successfully.');
});

export default {
  syncAnalytics,
  getPostAnalytics,
  getWorkspaceAnalytics,
  getHistoricalAnalytics
};
