import { AppError } from '../errors/AppError.js';
import PostRepository from '../repositories/PostRepository.js';
import ScheduleRepository from '../repositories/ScheduleRepository.js';
import SocialAccountRepository from '../repositories/SocialAccountRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import { QueueName } from '../types/index.js';
import { schedulerQueue } from '../jobs/queues/scheduler.queue.js';
import { logger } from '../logger/index.js';
import PublisherService from './PublisherService.js';

export class SchedulingService {
  async createSchedule(payload) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(payload.workspaceId, payload.userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    const post = await PostRepository.findById(payload.postId);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }

    if (post.workspaceId !== payload.workspaceId) {
      throw new AppError('Post does not belong to the provided workspace.', 400);
    }

    const socialAccount = await SocialAccountRepository.findById(payload.socialAccountId);
    if (!socialAccount) {
      throw new AppError('Social account not found.', 404);
    }

    const schedule = await ScheduleRepository.createSchedule({
      postId: payload.postId,
      socialAccountId: payload.socialAccountId,
      scheduledAt: payload.scheduledAt,
      status: 'PENDING'
    });

    const destination = await ScheduleRepository.createDestination({
      postId: payload.postId,
      socialAccountId: payload.socialAccountId,
      scheduleId: schedule.id,
      status: 'PENDING'
    });

    await PostRepository.update(payload.postId, { status: 'SCHEDULED' });

    await schedulerQueue.add(
      QueueName.PUBLISH,
      {
        scheduleId: schedule.id,
        attempt: 0
      },
      {
        jobId: schedule.id,
        delay: Math.max(0, new Date(payload.scheduledAt).getTime() - Date.now()),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    );

    return { schedule, destination };
  }

  async getSchedule(scheduleId, userId) {
    const schedule = await ScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new AppError('Schedule not found.', 404);
    }

    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(schedule.post.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return schedule;
  }

  async getWorkspaceSchedules(workspaceId, userId) {
    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    return ScheduleRepository.findByWorkspaceId(workspaceId);
  }

  async deleteSchedule(scheduleId, userId) {
    const schedule = await ScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new AppError('Schedule not found.', 404);
    }

    const membership = await WorkspaceMemberRepository.findByWorkspaceAndUser(schedule.post.workspaceId, userId);
    if (!membership || membership.deletedAt) {
      throw new AppError('You are not a member of this workspace.', 403);
    }

    await schedulerQueue.remove(scheduleId);
    return ScheduleRepository.delete(scheduleId);
  }

  async processSchedule(scheduleId) {
    return PublisherService.publishPost(scheduleId);
  }
}

export default new SchedulingService();
