// ==========================================
// Workspace Operations Service (WorkspaceService.js)
// Workspace memberships, roles, CRUD, and invitations
// ==========================================

import crypto from 'crypto';
import WorkspaceRepository from '../repositories/WorkspaceRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import WorkspaceInvitationRepository from '../repositories/WorkspaceInvitationRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import { AppError } from '../errors/AppError.js';

export class WorkspaceService {
  /**
   * Creates a workspace and links the creator as OWNER
   * @param {string} name - Workspace name
   * @param {string} creatorId - User UUID
   * @returns {Promise<Object>} Created Workspace
   */
  async createWorkspace(name, creatorId) {
    const workspace = await WorkspaceRepository.create({ name });
    const member = await WorkspaceMemberRepository.create({
      workspaceId: workspace.id,
      userId: creatorId,
      role: 'OWNER'
    });

    return { workspace, member };
  }

  /**
   * Fetches user-accessible workspaces
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} List of Workspaces
   */
  async getUserWorkspaces(userId) {
    return WorkspaceRepository.findAllByUserId(userId);
  }

  /**
   * Fetches active workspace by ID
   * @param {string} id - Workspace UUID
   * @returns {Promise<Object>} Workspace entity
   */
  async getWorkspace(id) {
    const workspace = await WorkspaceRepository.findById(id);
    if (!workspace) {
      throw new AppError('Workspace not found.', 404);
    }
    return workspace;
  }

  /**
   * Updates workspace details
   * @param {string} id - Workspace UUID
   * @param {string} name - New name
   * @returns {Promise<Object>} Updated Workspace
   */
  async updateWorkspace(id, name) {
    await this.getWorkspace(id); // Ensure active workspace exists
    return WorkspaceRepository.update(id, { name });
  }

  /**
   * Performs soft deletion on workspace
   * @param {string} id - Workspace UUID
   */
  async deleteWorkspace(id) {
    await this.getWorkspace(id); // Ensure active workspace exists
    return WorkspaceRepository.delete(id);
  }

  /**
   * Invites a user to a workspace
   * @param {Object} params - Invitation parameters
   * @returns {Promise<Object>} Created invitation record
   */
  async inviteUser({ workspaceId, email, role, invitedById }) {
    await this.getWorkspace(workspaceId); // Verify active workspace exists

    // 1. Verify target is not already a member
    const targetUser = await UserRepository.findByEmail(email);
    if (targetUser) {
      const existingMember = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, targetUser.id);
      if (existingMember) {
        throw new AppError('User is already a member of this workspace.', 400);
      }
    }

    // 2. Clean up any existing pending invitations for this email in this workspace
    const pendingInvite = await WorkspaceInvitationRepository.findPendingByWorkspaceAndEmail(workspaceId, email);
    if (pendingInvite) {
      await WorkspaceInvitationRepository.delete(pendingInvite.id);
    }

    // 3. Create cryptographic invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Invitation valid for 7 days

    return WorkspaceInvitationRepository.create({
      workspaceId,
      email,
      role,
      token,
      invitedById,
      expiresAt
    });
  }

  /**
   * Accepts workspace invitation and provisions membership
   * @param {string} token - Invitation token
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<Object>} Accepted workspace info
   */
  async acceptInvitation(token, userId) {
    // 1. Find invitation details
    const invitation = await WorkspaceInvitationRepository.findByToken(token);
    if (!invitation) {
      throw new AppError('Invalid or expired invitation token.', 400);
    }

    if (invitation.acceptedAt) {
      throw new AppError('This invitation has already been accepted.', 400);
    }

    if (invitation.expiresAt < new Date()) {
      throw new AppError('This invitation token has expired.', 400);
    }

    // 2. Verify target user
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Authenticated user not found.', 404);
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new AppError('This invitation belongs to a different email address.', 400);
    }

    // 3. Prevent duplicate memberships (e.g. if they joined by another path in between)
    const existingMember = await WorkspaceMemberRepository.findByWorkspaceAndUser(invitation.workspaceId, user.id);
    if (existingMember) {
      // Mark invite accepted and return workspace
      await WorkspaceInvitationRepository.accept(invitation.id);
      return invitation.workspace;
    }

    // 4. Create membership mapping
    await WorkspaceMemberRepository.create({
      workspaceId: invitation.workspaceId,
      userId: user.id,
      role: invitation.role
    });

    // 5. Invalidate invitation
    await WorkspaceInvitationRepository.accept(invitation.id);

    return invitation.workspace;
  }

  /**
   * Declines/revokes workspace invitation
   * @param {string} token - Invitation token
   * @param {string} userId - Authenticated user UUID
   */
  async declineInvitation(token, userId) {
    const invitation = await WorkspaceInvitationRepository.findByToken(token);
    if (!invitation) {
      throw new AppError('Invitation token not found.', 400);
    }

    const user = await UserRepository.findById(userId);
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new AppError('Access Denied. You do not own this invitation.', 403);
    }

    await WorkspaceInvitationRepository.delete(invitation.id);
  }
}

export default new WorkspaceService();
