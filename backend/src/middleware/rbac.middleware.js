// ==========================================
// Role-Based Access Control Middleware (rbac.middleware.js)
// Validates membership and roles on target workspaces
// ==========================================

import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import { AppError } from '../errors/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Restricts access to members with specific roles in the target workspace
 * @param {Array<string>} allowedRoles - List of permitted roles (e.g., OWNER, ADMIN)
 * @returns {Function} Express middleware callback
 */
export const restrictTo = (...allowedRoles) => {
  return catchAsync(async (req, res, next) => {
    // 1. Determine target workspace ID from request parameters
    const workspaceId = req.params.workspaceId || req.params.id;

    if (!workspaceId) {
      return next(new AppError('Workspace context missing from the request URL.', 400));
    }

    // 2. Ensure user has authenticated profile attached
    if (!req.user) {
      return next(new AppError('Authentication context missing.', 401));
    }

    // 3. Look up workspace membership
    const member = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, req.user.id);
    if (!member) {
      return next(new AppError('Access Denied. You are not a member of this workspace.', 403));
    }

    // 4. Validate role credentials
    if (!allowedRoles.includes(member.role)) {
      return next(new AppError('Access Denied. You do not have permission to execute this action.', 403));
    }

    // 5. Attach member metadata to request context
    req.member = member;
    next();
  });
};

export default restrictTo;
