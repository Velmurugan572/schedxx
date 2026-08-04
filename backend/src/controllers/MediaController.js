// =====================================================================
// Media Controller (MediaController.js)
// Maps incoming HTTP requests to MediaService actions
// =====================================================================

import MediaService from '../services/MediaService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../errors/AppError.js';

export const uploadAsset = catchAsync(async (req, res) => {
  const { workspaceId } = req.body;
  if (!workspaceId) {
    throw new AppError('Workspace ID is required.', 400);
  }
  if (!req.file) {
    throw new AppError('No file uploaded.', 400);
  }

  // Map file properties from multer request
  const payload = {
    workspaceId,
    userId: req.user.id,
    name: req.file.originalname,
    // Store relative fileUrl referencing local storage uploads path
    fileUrl: `/uploads/${req.file.filename || req.file.originalname}`,
    mimeType: req.file.mimetype,
    fileSize: req.file.size
  };

  const result = await MediaService.uploadAsset(payload);
  sendSuccess(res, result, 201, 'Media asset uploaded and registered successfully.');
});

export const listWorkspaceMedia = catchAsync(async (req, res) => {
  const { workspaceId } = req.params;
  const result = await MediaService.listWorkspaceMedia(workspaceId, req.user.id);
  sendSuccess(res, result, 200, 'Workspace media assets retrieved successfully.');
});

export const deleteAsset = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MediaService.deleteAsset(id, req.user.id);
  sendSuccess(res, result, 200, 'Media asset soft-deleted successfully.');
});

export const attachToPost = catchAsync(async (req, res) => {
  const { postId, mediaAssetId } = req.body;
  if (!postId || !mediaAssetId) {
    throw new AppError('Both postId and mediaAssetId are required.', 400);
  }

  const result = await MediaService.attachMediaToPost(postId, mediaAssetId, req.user.id);
  sendSuccess(res, result, 201, 'Media asset attached to post successfully.');
});

export const detachFromPost = catchAsync(async (req, res) => {
  const { postId, mediaAssetId } = req.body;
  if (!postId || !mediaAssetId) {
    throw new AppError('Both postId and mediaAssetId are required.', 400);
  }

  const result = await MediaService.detachMediaFromPost(postId, mediaAssetId, req.user.id);
  sendSuccess(res, result, 200, 'Media asset detached from post successfully.');
});

export default {
  uploadAsset,
  listWorkspaceMedia,
  deleteAsset,
  attachToPost,
  detachFromPost
};
