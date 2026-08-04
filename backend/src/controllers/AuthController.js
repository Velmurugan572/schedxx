// ==========================================
// Authentication Controller (AuthController.js)
// Maps incoming HTTP requests to AuthService actions
// ==========================================

import AuthService from '../services/AuthService.js';
import AuditLogService from '../services/AuditLogService.js';
import WorkspaceRepository from '../repositories/WorkspaceRepository.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const result = await AuthService.register({
    email,
    password,
    firstName,
    lastName
  });

  // Log audit event
  await AuditLogService.logEvent({
    workspaceId: result.workspaceId,
    userId: result.user.id,
    action: 'USER_REGISTER',
    entityType: 'User',
    entityId: result.user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  sendSuccess(res, result, 201, 'User registration completed successfully.');
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  // Log audit event
  const workspaces = await WorkspaceRepository.findAllByUserId(result.user.id);
  const workspaceId = workspaces.length > 0 ? workspaces[0].id : null;
  if (workspaceId) {
    await AuditLogService.logEvent({
      workspaceId,
      userId: result.user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: result.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }

  sendSuccess(res, result, 200, 'User logged in successfully.');
});

export const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await AuthService.refreshSession(refreshToken);

  sendSuccess(res, result, 200, 'Session tokens refreshed successfully.');
});

export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  await AuthService.logout(refreshToken);

  sendSuccess(res, null, 200, 'Session terminated successfully.');
});

export default {
  register,
  login,
  refresh,
  logout
};
