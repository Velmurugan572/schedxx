import { AppError } from '../errors/AppError.js';
import PostRepository from '../repositories/PostRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import AuditLogService from './AuditLogService.js';

export class PostService {
  /**
   * Creates a draft post for a workspace.
   * @param {Object} payload - { workspaceId, userId, title, content }
   * @returns {Promise<Object>} Created post
   */
  async createPost(payload) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(payload.workspaceId, payload.userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    const post = await PostRepository.create({
      workspaceId: payload.workspaceId,
      userId: payload.userId,
      title: payload.title,
      content: payload.content,
      status: 'DRAFT'
    });

    // Log audit event
    await AuditLogService.logEvent({
      workspaceId: post.workspaceId,
      userId: post.userId,
      action: 'POST_CREATED',
      entityType: 'Post',
      entityId: post.id
    });

    return post;
  }

  /**
   * Lists workspace posts for the current user.
   * @param {string} workspaceId - Workspace UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} Workspace posts
   */
  async getWorkspacePosts(workspaceId, userId) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return PostRepository.findByWorkspaceId(workspaceId);
  }

  /**
   * Retrieves a single post if the user is a workspace member.
   * @param {string} postId - Post UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Post details
   */
  async getPost(postId, userId) {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(post.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return post;
  }

  /**
   * Updates a post owned by the current user.
   * @param {string} postId - Post UUID
   * @param {string} userId - User UUID
   * @param {Object} updates - Editable fields
   * @returns {Promise<Object>} Updated post
   */
  async updatePost(postId, userId, updates) {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    if (post.userId !== userId) {
      throw new AppError('Only the author can update this post.', 403);
    }

    const updatedPost = await PostRepository.update(postId, updates);

    // Log audit event
    await AuditLogService.logEvent({
      workspaceId: updatedPost.workspaceId,
      userId,
      action: 'POST_UPDATED',
      entityType: 'Post',
      entityId: updatedPost.id
    });

    return updatedPost;
  }

  /**
   * Soft-deletes a post authored by the current user.
   * @param {string} postId - Post UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Deleted post
   */
  async deletePost(postId, userId) {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    if (post.userId !== userId) {
      throw new AppError('Only the author can delete this post.', 403);
    }

    const deletedPost = await PostRepository.delete(postId);

    // Log audit event
    await AuditLogService.logEvent({
      workspaceId: deletedPost.workspaceId,
      userId,
      action: 'POST_DELETED',
      entityType: 'Post',
      entityId: deletedPost.id
    });

    return deletedPost;
  }
}

export default new PostService();
