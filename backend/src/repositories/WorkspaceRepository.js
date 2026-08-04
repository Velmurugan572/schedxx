// ==========================================
// Workspace Data Repository (WorkspaceRepository.js)
// ==========================================

import prisma from '../database/prisma.js';

export class WorkspaceRepository {
  /**
   * Creates a new workspace
   * @param {Object} data - Create workspace details
   * @returns {Promise<Object>} Created workspace
   */
  async create(data) {
    return prisma.workspace.create({
      data: {
        name: data.name
      }
    });
  }

  /**
   * Finds an active workspace by ID
   * @param {string} id - Workspace UUID
   * @returns {Promise<Object|null>} Workspace details or null
   */
  async findById(id) {
    return prisma.workspace.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
  }

  /**
   * Updates workspace details
   * @param {string} id - Workspace UUID
   * @param {Object} data - Update payloads
   * @returns {Promise<Object>} Updated workspace
   */
  async update(id, data) {
    return prisma.workspace.update({
      where: { id },
      data
    });
  }

  /**
   * Performs soft deletion on a workspace
   * @param {string} id - Workspace UUID
   * @returns {Promise<Object>} Soft-deleted workspace
   */
  async delete(id) {
    return prisma.workspace.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Finds all active workspaces linked to a specific user
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} List of workspaces
   */
  async findAllByUserId(userId) {
    return prisma.workspace.findMany({
      where: {
        deletedAt: null,
        members: {
          some: {
            userId,
            deletedAt: null
          }
        }
      },
      include: {
        members: {
          where: {
            userId,
            deletedAt: null
          },
          select: {
            role: true
          }
        }
      }
    });
  }
}

export default new WorkspaceRepository();
