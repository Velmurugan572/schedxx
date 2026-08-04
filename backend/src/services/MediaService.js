import { AppError } from '../errors/AppError.js';
import MediaRepository from '../repositories/MediaRepository.js';
import PostRepository from '../repositories/PostRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import AuditLogService from './AuditLogService.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/mpeg'
];

export class MediaService {
  /**
   * Uploads and registers a new media asset.
   * @param {Object} payload - { workspaceId, userId, name, fileUrl, mimeType, fileSize, width, height }
   * @returns {Promise<Object>} Registered MediaAsset
   */
  async uploadAsset(payload) {
    // 1. Validate workspace membership
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(payload.workspaceId, payload.userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    // 2. Validate file size
    if (payload.fileSize > MAX_FILE_SIZE) {
      throw new AppError('File size exceeds the maximum limit of 10MB.', 400);
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(payload.mimeType) && 
        !payload.mimeType.startsWith('image/') && 
        !payload.mimeType.startsWith('video/')) {
      throw new AppError('Invalid file type. Only images and videos are allowed.', 400);
    }

    // 4. Create repository record
    const asset = await MediaRepository.create(payload);

    // Log audit event
    await AuditLogService.logEvent({
      workspaceId: asset.workspaceId,
      userId: payload.userId,
      action: 'MEDIA_UPLOADED',
      entityType: 'MediaAsset',
      entityId: asset.id
    });

    return asset;
  }

  /**
   * Lists all media assets inside a workspace.
   * @param {string} workspaceId - Workspace UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} List of media assets
   */
  async listWorkspaceMedia(workspaceId, userId) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return MediaRepository.findByWorkspaceId(workspaceId);
  }

  /**
   * Soft-deletes a media asset from a workspace.
   * @param {string} mediaAssetId - MediaAsset UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Soft-deleted MediaAsset
   */
  async deleteAsset(mediaAssetId, userId) {
    const asset = await MediaRepository.findById(mediaAssetId);
    if (!asset) {
      throw new AppError('Media asset not found.', 404);
    }

    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(asset.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    const deletedAsset = await MediaRepository.delete(mediaAssetId);

    // Log audit event
    await AuditLogService.logEvent({
      workspaceId: deletedAsset.workspaceId,
      userId,
      action: 'MEDIA_DELETED',
      entityType: 'MediaAsset',
      entityId: deletedAsset.id
    });

    return deletedAsset;
  }

  /**
   * Attaches a media asset to a draft post.
   * @param {string} postId - Post UUID
   * @param {string} mediaAssetId - MediaAsset UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Created PostMedia junction record
   */
  async attachMediaToPost(postId, mediaAssetId, userId) {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    const asset = await MediaRepository.findById(mediaAssetId);
    if (!asset) {
      throw new AppError('Media asset not found.', 404);
    }

    // Security: Ensure post and asset reside in the same workspace tenancy
    if (post.workspaceId !== asset.workspaceId) {
      throw new AppError('Media asset and post must belong to the same workspace.', 400);
    }

    // Security: Validate user workspace membership
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(post.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    // Idempotency: Return existing attachment if already mapped
    const existing = await MediaRepository.findAttachment(postId, mediaAssetId);
    if (existing) {
      return existing;
    }

    // Get current attachments to calculate sortOrder index
    const currentAttachments = await MediaRepository.findPostAttachments(postId);
    return MediaRepository.attachToPost(postId, mediaAssetId, currentAttachments.length);
  }

  /**
   * Detaches a media asset from a draft post.
   * @param {string} postId - Post UUID
   * @param {string} mediaAssetId - MediaAsset UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Deleted PostMedia junction record
   */
  async detachMediaFromPost(postId, mediaAssetId, userId) {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    const asset = await MediaRepository.findById(mediaAssetId);
    if (!asset) {
      throw new AppError('Media asset not found.', 404);
    }

    // Security: Validate user workspace membership
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(post.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    const attachment = await MediaRepository.findAttachment(postId, mediaAssetId);
    if (!attachment) {
      throw new AppError('Media asset is not attached to this post.', 404);
    }

    return MediaRepository.detachFromPost(postId, mediaAssetId);
  }
}

export default new MediaService();
