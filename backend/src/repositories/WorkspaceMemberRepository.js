// ==========================================
// Workspace Member Repository (WorkspaceMemberRepository.js)
// ==========================================

import prisma from '../database/prisma.js';

export class WorkspaceMemberRepository {
  /**
   * Links a user to a workspace with a role
   * @param {Object} data - Membership params
   * @returns {Promise<Object>} Member record
   */
  async create({ workspaceId, userId, role }) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role
      }
    });
  }

  /**
   * Finds membership link for a user in a workspace
   * @param {string} workspaceId - Workspace UUID
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} Membership or null
   */
  async findByWorkspaceAndUser(workspaceId, userId) {
    return prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        deletedAt: null
      }
    });
  }

  /**
   * Updates a member role
   * @param {string} id - WorkspaceMember UUID
   * @param {string} role - Target WorkspaceRole enum value
   * @returns {Promise<Object>} Updated membership
   */
  async updateRole(id, role) {
    return prisma.workspaceMember.update({
      where: { id },
      data: { role }
    });
  }

  /**
   * Soft-deletes workspace membership
   * @param {string} id - WorkspaceMember UUID
   * @returns {Promise<Object>} Soft-deleted member
   */
  async delete(id) {
    return prisma.workspaceMember.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /**
   * Retrieves all active members inside a workspace
   * @param {string} workspaceId - Workspace UUID
   * @returns {Promise<Array>} List of members with user profiles
   */
  async findMembersByWorkspaceId(workspaceId) {
    return prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }
}

export default new WorkspaceMemberRepository();
