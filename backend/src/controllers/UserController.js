// ==========================================
// User Operations Controller (UserController.js)
// Maps user retrieval requests
// ==========================================

import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getMe = catchAsync(async (req, res) => {
  const user = { ...req.user };
  
  // Strip out sensitive password credentials before sending to user
  delete user.passwordHash;

  sendSuccess(res, user, 200, 'User profile retrieved successfully.');
});

export default {
  getMe
};
