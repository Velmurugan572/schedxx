// ==========================================
// Post Operations Controller (PostController.js)
// ==========================================

import PostService from '../services/PostService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPost = catchAsync(async (req, res) => {
  const result = await PostService.createPost({
    workspaceId: req.body.workspaceId,
    userId: req.user.id,
    title: req.body.title,
    content: req.body.content
  });

  sendSuccess(res, result, 201, 'Post created successfully.');
});

export const getWorkspacePosts = catchAsync(async (req, res) => {
  const result = await PostService.getWorkspacePosts(req.params.workspaceId, req.user.id);

  sendSuccess(res, result, 200, 'Workspace posts retrieved successfully.');
});

export const getPost = catchAsync(async (req, res) => {
  const result = await PostService.getPost(req.params.id, req.user.id);

  sendSuccess(res, result, 200, 'Post retrieved successfully.');
});

export const updatePost = catchAsync(async (req, res) => {
  const result = await PostService.updatePost(req.params.id, req.user.id, req.body);

  sendSuccess(res, result, 200, 'Post updated successfully.');
});

export const deletePost = catchAsync(async (req, res) => {
  await PostService.deletePost(req.params.id, req.user.id);

  sendSuccess(res, null, 200, 'Post deleted successfully.');
});

export default {
  createPost,
  getWorkspacePosts,
  getPost,
  updatePost,
  deletePost
};
