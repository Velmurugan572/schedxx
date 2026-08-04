import { jest } from '@jest/globals';

// Mock schedulerQueue to avoid real Redis connection on import
jest.unstable_mockModule('../jobs/queues/scheduler.queue.js', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    remove: jest.fn().mockResolvedValue(true)
  };
  return {
    schedulerQueue: mockQueue,
    default: mockQueue
  };
});

// Mock PublisherService to isolate schedule tests from database/connector requirements
jest.unstable_mockModule('../services/PublisherService.js', () => {
  return {
    default: {
      publishPost: jest.fn()
    }
  };
});

// Mock database repositories to avoid caching real ones in ESM
jest.unstable_mockModule('../repositories/PostRepository.js', () => {
  return {
    default: {
      findById: jest.fn(),
      update: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/MediaRepository.js', () => {
  return {
    default: {
      create: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      delete: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/AuditLogRepository.js', () => {
  return {
    default: {
      create: jest.fn(),
      findByWorkspaceId: jest.fn()
    }
  };
});

jest.unstable_mockModule('../database/prisma.js', () => {
  const mockPrisma = {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $disconnect: jest.fn().mockResolvedValue()
  };
  return {
    prisma: mockPrisma,
    default: mockPrisma
  };
});

jest.unstable_mockModule('../repositories/PublishRepository.js', () => {
  return {
    default: {
      findDestinationById: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/AnalyticsRepository.js', () => {
  return {
    default: {
      createMetric: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/NotificationRepository.js', () => {
  return {
    default: {
      create: jest.fn()
    }
  };
});

// Dynamically import dependencies after mocking
const { default: SchedulingService } = await import('../services/SchedulingService.js');
const { default: WorkspaceMemberRepository } = await import('../repositories/WorkspaceMemberRepository.js');
const { default: PostRepository } = await import('../repositories/PostRepository.js');
const { default: SocialAccountRepository } = await import('../repositories/SocialAccountRepository.js');
const { default: ScheduleRepository } = await import('../repositories/ScheduleRepository.js');
const { default: PublisherService } = await import('../services/PublisherService.js');

describe('SchedulingService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a pending schedule and destination for a workspace member', async () => {
    const membership = { id: 'membership-1', workspaceId: 'workspace-1', userId: 'user-1' };
    const post = { id: 'post-1', workspaceId: 'workspace-1', userId: 'user-1', status: 'DRAFT' };
    const socialAccount = { id: 'social-1', integration: { workspaceId: 'workspace-1' } };
    const createdSchedule = { id: 'schedule-1', status: 'PENDING' };
    const createdDestination = { id: 'destination-1', status: 'PENDING' };

    jest.spyOn(WorkspaceMemberRepository, 'findByWorkspaceAndUser').mockResolvedValue(membership);
    jest.spyOn(PostRepository, 'findById').mockResolvedValue(post);
    jest.spyOn(SocialAccountRepository, 'findById').mockResolvedValue(socialAccount);
    jest.spyOn(ScheduleRepository, 'createSchedule').mockResolvedValue(createdSchedule);
    jest.spyOn(ScheduleRepository, 'createDestination').mockResolvedValue(createdDestination);
    jest.spyOn(PostRepository, 'update').mockResolvedValue({ ...post, status: 'SCHEDULED' });

    const result = await SchedulingService.createSchedule({
      workspaceId: 'workspace-1',
      userId: 'user-1',
      postId: 'post-1',
      socialAccountId: 'social-1',
      scheduledAt: new Date('2030-01-01T00:00:00.000Z')
    });

    expect(result.schedule.id).toBe('schedule-1');
    expect(result.destination.id).toBe('destination-1');
    expect(PostRepository.update).toHaveBeenCalledWith('post-1', { status: 'SCHEDULED' });
  });

  it('processes a scheduled job and updates the schedule and destination statuses', async () => {
    const schedule = {
      id: 'schedule-1',
      postId: 'post-1',
      socialAccountId: 'social-1',
      status: 'PENDING',
      scheduledAt: new Date('2030-01-01T00:00:00.000Z'),
      post: { id: 'post-1', workspaceId: 'workspace-1', status: 'SCHEDULED' },
      socialAccount: { id: 'social-1', platformUsername: 'demo-page' }
    };
    const destination = { id: 'destination-1', status: 'PENDING' };

    const mockPublishResult = {
      success: true,
      schedule: { ...schedule, status: 'COMPLETED' },
      destination: { ...destination, status: 'PUBLISHED' }
    };
    PublisherService.publishPost.mockResolvedValue(mockPublishResult);

    const result = await SchedulingService.processSchedule('schedule-1');

    expect(result.schedule.status).toBe('COMPLETED');
    expect(result.destination.status).toBe('PUBLISHED');
    expect(PublisherService.publishPost).toHaveBeenCalledWith('schedule-1');
  });
});
