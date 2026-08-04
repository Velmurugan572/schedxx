// ==========================================
// Workspace Operations Controller (WorkspaceController.js)
// Maps incoming HTTP requests to WorkspaceService operations
// ==========================================

import WorkspaceService from '../services/WorkspaceService.js';
import AuditLogService from '../services/AuditLogService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createWorkspace = catchAsync(async (req, res) => {
  const { name } = req.body;

  const result = await WorkspaceService.createWorkspace(name, req.user.id);

  // Log audit event
  await AuditLogService.logEvent({
    workspaceId: result.workspace.id,
    userId: req.user.id,
    action: 'WORKSPACE_CREATED',
    entityType: 'Workspace',
    entityId: result.workspace.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  sendSuccess(res, result, 201, 'Workspace created successfully.');
});

export const getUserWorkspaces = catchAsync(async (req, res) => {
  const result = await WorkspaceService.getUserWorkspaces(req.user.id);

  sendSuccess(res, result, 200, 'User workspaces retrieved successfully.');
});

export const getWorkspace = catchAsync(async (req, res) => {
  const result = await WorkspaceService.getWorkspace(req.params.id);

  sendSuccess(res, result, 200, 'Workspace details retrieved successfully.');
});

export const updateWorkspace = catchAsync(async (req, res) => {
  const { name } = req.body;

  const result = await WorkspaceService.updateWorkspace(req.params.id, name);

  sendSuccess(res, result, 200, 'Workspace updated successfully.');
});

export const deleteWorkspace = catchAsync(async (req, res) => {
  await WorkspaceService.deleteWorkspace(req.params.id);

  sendSuccess(res, null, 200, 'Workspace soft-deleted successfully.');
});

export const inviteUser = catchAsync(async (req, res) => {
  const { email, role } = req.body;
  const workspaceId = req.params.id; // Targets /workspaces/:id/invitations

  const result = await WorkspaceService.inviteUser({
    workspaceId,
    email,
    role: role || 'MEMBER',
    invitedById: req.user.id
  });

  // Log audit event
  await AuditLogService.logEvent({
    workspaceId,
    userId: req.user.id,
    action: 'MEMBER_INVITED',
    entityType: 'WorkspaceMember',
    entityId: result.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  sendSuccess(res, result, 201, 'Workspace invitation sent successfully.');
});

export const acceptInvitation = catchAsync(async (req, res) => {
  const { token } = req.params;

  const result = await WorkspaceService.acceptInvitation(token, req.user.id);

  sendSuccess(res, result, 200, 'Workspace invitation accepted successfully.');
});

export const declineInvitation = catchAsync(async (req, res) => {
  const { token } = req.params;

  await WorkspaceService.declineInvitation(token, req.user.id);

  sendSuccess(res, null, 200, 'Workspace invitation declined.');
});

export default {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteUser,
  acceptInvitation,
  declineInvitation
};
