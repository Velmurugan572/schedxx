// ==========================================
// Workspace Route Configuration (workspace.routes.js)
// Defines protected workspace CRUD and invitation endpoints
// ==========================================

import express from 'express';
import WorkspaceController from '../../controllers/WorkspaceController.js';
import protect from '../../middleware/auth.middleware.js';
import { restrictTo } from '../../middleware/rbac.middleware.js';
import {
  validateCreateWorkspace,
  validateUpdateWorkspace,
  validateInviteUser
} from '../../validators/workspace.validator.js';

const router = express.Router();

// Apply auth protection globally to all workspace endpoints
router.use(protect);

// Global Invitation Acceptance Endpoints
router.post('/invitations/:token/accept', WorkspaceController.acceptInvitation);
router.post('/invitations/:token/decline', WorkspaceController.declineInvitation);

// Workspace Collection Routes
router.route('/')
  .post(validateCreateWorkspace, WorkspaceController.createWorkspace)
  .get(WorkspaceController.getUserWorkspaces);

// Workspace Individual Routes (Requires specific member roles via RBAC restrictTo)
router.route('/:id')
  .get(restrictTo('OWNER', 'ADMIN', 'MEMBER', 'EDITOR'), WorkspaceController.getWorkspace)
  .patch(restrictTo('OWNER', 'ADMIN'), validateUpdateWorkspace, WorkspaceController.updateWorkspace)
  .delete(restrictTo('OWNER'), WorkspaceController.deleteWorkspace);

// Workspace Invitation Triggers
router.post(
  '/:id/invitations',
  restrictTo('OWNER', 'ADMIN'),
  validateInviteUser,
  WorkspaceController.inviteUser
);

export default router;
