// ==========================================
// AI Controller Interface Adapter (AIController.js)
// Extracts HTTP parameters and triggers service calls
// ==========================================

import AIService from '../ai/services/AIService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const generateContent = catchAsync(async (req, res) => {
  const result = await AIService.generateContent({
    workspaceId: req.body.workspaceId,
    userId: req.user.id,
    prompt: req.body.prompt,
    platform: req.body.platform,
    tone: req.body.tone,
    providerName: req.body.providerName
  });

  sendSuccess(res, result, 200, 'Content generated successfully.');
});

export const getWorkspaceHistory = catchAsync(async (req, res) => {
  const result = await AIService.getWorkspaceHistory(req.params.workspaceId, req.user.id);

  sendSuccess(res, result, 200, 'AI History logs retrieved successfully.');
});

export default {
  generateContent,
  getWorkspaceHistory
};
