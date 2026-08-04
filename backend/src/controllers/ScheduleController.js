import SchedulingService from '../services/SchedulingService.js';
import { sendSuccess } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createSchedule = catchAsync(async (req, res) => {
  const result = await SchedulingService.createSchedule({
    workspaceId: req.body.workspaceId,
    userId: req.user.id,
    postId: req.body.postId,
    socialAccountId: req.body.socialAccountId,
    scheduledAt: req.body.scheduledAt
  });

  sendSuccess(res, result, 201, 'Schedule created successfully.');
});

export const getSchedule = catchAsync(async (req, res) => {
  const result = await SchedulingService.getSchedule(req.params.id, req.user.id);

  sendSuccess(res, result, 200, 'Schedule retrieved successfully.');
});

export const getWorkspaceSchedules = catchAsync(async (req, res) => {
  const result = await SchedulingService.getWorkspaceSchedules(req.params.workspaceId, req.user.id);

  sendSuccess(res, result, 200, 'Workspace schedules retrieved successfully.');
});

export const deleteSchedule = catchAsync(async (req, res) => {
  await SchedulingService.deleteSchedule(req.params.id, req.user.id);

  sendSuccess(res, null, 200, 'Schedule deleted successfully.');
});

export default {
  createSchedule,
  getSchedule,
  getWorkspaceSchedules,
  deleteSchedule
};
