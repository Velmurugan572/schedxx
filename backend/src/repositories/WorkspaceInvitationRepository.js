// ==========================================
// Workspace Invitation Repository (WorkspaceInvitationRepository.js)
// ==========================================

import prisma from '../database/prisma.js';

export class WorkspaceInvitationRepository {
  /**
   * Creates a workspace invitation record
   * @param {Object} data - Invitation data
   * @returns {Promise<Object>} Created invitation record
   */
  async create({ workspaceId, email, role, token, invitedById, expiresAt }) {
    return prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email: email.toLowerCase(),
        role,
        token,
        invitedById,
        expiresAt
      }
    });
  }

  /**
   * Finds invitation by token
   * @param {string} token - Cryptographic invitation token
   * @returns {Promise<Object|null>} Invitation or null
   */
  async findByToken(token) {
    return prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Finds pending invitation for email in workspace
   * @param {string} workspaceId - Workspace UUID
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Invitation or null
   */
  async findPendingByWorkspaceAndEmail(workspaceId, email) {
    return prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email: email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
  }

  /**
   * Marks an invitation as accepted
   * @param {string} id - Invitation UUID
   * @returns {Promise<Object>} Updated invitation
   */
  async accept(id) {
    return prisma.workspaceInvitation.update({
      where: { id },
      data: { acceptedAt: new Date() }
    });
  }

  /**
   * Deletes an invitation record (e.g., when revoked/declined)
   * @param {string} id - Invitation UUID
   * @returns {Promise<Object>} Deleted invitation record
   */
  async delete(id) {
    return prisma.workspaceInvitation.delete({
      where: { id }
    });
  }
}

export default new WorkspaceInvitationRepository();
