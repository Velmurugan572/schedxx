// ==========================================
// Post Data Access Repository (PostRepository.js)
// ==========================================

import prisma from '../database/prisma.js';

export class PostRepository {
  /**
   * Creates a new post record.
   * @param {Object} data - Post creation payload
   * @returns {Promise<Object>} Created post
   */
  async create(data) {
    return prisma.post.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        title: data.title ?? null,
        content: data.content,
        status: data.status || 'DRAFT'
      },
      include: {
        media: {
          include: {
            mediaAsset: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });
  }

  /**
   * Lists non-deleted posts inside a workspace.
   * @param {string} workspaceId - Workspace UUID
   * @returns {Promise<Array>} List of posts
   */
  async findByWorkspaceId(workspaceId) {
    return prisma.post.findMany({
      where: {
        workspaceId,
        deletedAt: null
      },
      include: {
        media: {
          include: {
            mediaAsset: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Finds a single non-deleted post by identifier.
   * @param {string} id - Post UUID
   * @returns {Promise<Object|null>} Post or null
   */
  async findById(id) {
    return prisma.post.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        media: {
          include: {
            mediaAsset: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });
  }

  /**
   * Updates a post record.
   * @param {string} id - Post UUID
   * @param {Object} data - Update values
   * @returns {Promise<Object>} Updated post
   */
  async update(id, data) {
    return prisma.post.update({
      where: { id },
      data,
      include: {
        media: {
          include: {
            mediaAsset: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });
  }

  /**
   * Soft-deletes a post record.
   * @param {string} id - Post UUID
   * @returns {Promise<Object>} Updated post
   */
  async delete(id) {
    return prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export default new PostRepository();
