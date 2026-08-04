// =====================================================================
// Media Repository (MediaRepository.js)
// Handles data persistence queries for MediaAsset and PostMedia models
// =====================================================================

import prisma from '../database/prisma.js';

export class MediaRepository {
  /**
   * Creates a new MediaAsset record.
   * @param {Object} data - { workspaceId, userId, name, fileUrl, mimeType, fileSize, width, height }
   * @returns {Promise<Object>} Created MediaAsset
   */
  async create(data) {
    return prisma.mediaAsset.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        name: data.name,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        width: data.width ?? null,
        height: data.height ?? null
      }
    });
  }

  /**
   * Finds a non-deleted MediaAsset by its ID.
   * @param {string} id - MediaAsset UUID
   * @returns {Promise<Object|null>} MediaAsset or null
   */
  async findById(id) {
    return prisma.mediaAsset.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
  }

  /**
   * Retrieves all non-deleted MediaAssets inside a workspace.
   * @param {string} workspaceId - Workspace UUID
   * @returns {Promise<Array>} List of MediaAssets
   */
  async findByWorkspaceId(workspaceId) {
    return prisma.mediaAsset.findMany({
      where: {
        workspaceId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Soft-deletes a MediaAsset record.
   * @param {string} id - MediaAsset UUID
   * @returns {Promise<Object>} Updated MediaAsset
   */
  async delete(id) {
    return prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Links a MediaAsset to a Post (PostMedia junction).
   * @param {string} postId - Post UUID
   * @param {string} mediaAssetId - MediaAsset UUID
   * @param {number} sortOrder - Order index
   * @returns {Promise<Object>} PostMedia junction record
   */
  async attachToPost(postId, mediaAssetId, sortOrder = 0) {
    return prisma.postMedia.create({
      data: {
        postId,
        mediaAssetId,
        sortOrder
      }
    });
  }

  /**
   * Removes the link between a MediaAsset and a Post.
   * @param {string} postId - Post UUID
   * @param {string} mediaAssetId - MediaAsset UUID
   * @returns {Promise<Object>} Deleted junction record
   */
  async detachFromPost(postId, mediaAssetId) {
    return prisma.postMedia.delete({
      where: {
        postId_mediaAssetId: {
          postId,
          mediaAssetId
        }
      }
    });
  }

  /**
   * Finds a PostMedia record by postId and mediaAssetId.
   * @param {string} postId - Post UUID
   * @param {string} mediaAssetId - MediaAsset UUID
   * @returns {Promise<Object|null>} PostMedia record or null
   */
  async findAttachment(postId, mediaAssetId) {
    return prisma.postMedia.findUnique({
      where: {
        postId_mediaAssetId: {
          postId,
          mediaAssetId
        }
      }
    });
  }

  /**
   * Finds all PostMedia records associated with a Post, including their MediaAssets.
   * @param {string} postId - Post UUID
   * @returns {Promise<Array>} List of PostMedia attachments
   */
  async findPostAttachments(postId) {
    return prisma.postMedia.findMany({
      where: {
        postId
      },
      include: {
        mediaAsset: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
  }
}

export default new MediaRepository();
