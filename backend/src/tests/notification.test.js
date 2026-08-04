// ==========================================
// Notification System Unit Tests (notification.test.js)
// Verifies notification APIs and FailureHandler integration
// ==========================================

import { jest } from '@jest/globals';

// 1. Mock connection packages to prevent live socket connection attempts
jest.unstable_mockModule('ioredis', () => {
  return {
    default: class {
      constructor() {
        this.on = jest.fn();
      }
    }
  };
});

jest.unstable_mockModule('bullmq', () => {
  return {
    Queue: class {
      constructor() {}
      add() {}
      remove() {}
    },
    Worker: class {
      constructor() {}
      on() {}
    }
  };
});

// 2. Mock database repositories to bypass real SQL execution
jest.unstable_mockModule('../repositories/UserRepository.js', () => {
  return {
    default: {
      findById: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/PostRepository.js', () => {
  return {
    default: {
      findById: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/PublishRepository.js', () => {
  return {
    default: {
      updateDestinationStatus: jest.fn(),
      updateScheduleStatus: jest.fn(),
      updatePostStatus: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/NotificationRepository.js', () => {
  return {
    default: {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findByIdAndUser: jest.fn(),
      update: jest.fn(),
      markAllAsRead: jest.fn()
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

// 3. Mock Prisma Client (prevent database connection errors on bootstrap)
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

// 4. Dynamically import modules after registering mock modules
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: UserRepository } = await import('../repositories/UserRepository.js');
const { default: PostRepository } = await import('../repositories/PostRepository.js');
const { default: NotificationRepository } = await import('../repositories/NotificationRepository.js');
const { default: FailureHandler } = await import('../services/FailureHandler.js');
const { default: jwt } = await import('jsonwebtoken');
const { env } = await import('../config/env.js');

describe('Notification System API & Failure Integration (Isolated)', () => {
  const mockUser = { id: 'user-1', email: 'user@sched.com', firstName: 'Test', lastName: 'User' };
  const mockToken = jwt.sign({ id: 'user-1' }, env.jwtSecret);
  const notificationId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  const workspaceId = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00';
  const postId = 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  beforeEach(() => {
    jest.clearAllMocks();
    UserRepository.findById.mockResolvedValue(mockUser);
  });

  it('retrieves notifications for the authenticated user', async () => {
    NotificationRepository.findByUserId.mockResolvedValue([
      { id: 'notif-1', title: 'Test Notif', message: 'Hello', type: 'INFO', isRead: false }
    ]);

    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Test Notif');
    expect(NotificationRepository.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('marks all notifications as read', async () => {
    NotificationRepository.markAllAsRead.mockResolvedValue({ count: 5 });

    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(NotificationRepository.markAllAsRead).toHaveBeenCalledWith('user-1');
  });

  it('marks a single notification as read', async () => {
    const mockNotif = { id: notificationId, userId: 'user-1', title: 'Title', message: 'Msg', isRead: false };
    NotificationRepository.findByIdAndUser.mockResolvedValue(mockNotif);
    NotificationRepository.update.mockResolvedValue({ ...mockNotif, isRead: true });

    const res = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);
    expect(NotificationRepository.update).toHaveBeenCalledWith(notificationId, expect.objectContaining({ isRead: true }));
  });

  it('returns 404 when marking a non-existent or unauthorized notification as read', async () => {
    NotificationRepository.findByIdAndUser.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  it('soft deletes a notification', async () => {
    const mockNotif = { id: notificationId, userId: 'user-1', title: 'Title', message: 'Msg' };
    NotificationRepository.findByIdAndUser.mockResolvedValue(mockNotif);
    NotificationRepository.update.mockResolvedValue({ ...mockNotif, deletedAt: new Date() });

    const res = await request(app)
      .delete(`/api/v1/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(NotificationRepository.update).toHaveBeenCalledWith(notificationId, expect.objectContaining({ deletedAt: expect.any(Date) }));
  });

  it('integrates with FailureHandler to dispatch notification on publish failure', async () => {
    const mockPost = { id: postId, workspaceId, userId: 'user-1' };
    PostRepository.findById.mockResolvedValue(mockPost);
    NotificationRepository.create.mockResolvedValue({ id: 'new-notif-1' });

    await FailureHandler.handleFailure('schedule-1', 'destination-1', postId, new Error('Connector error'));

    expect(PostRepository.findById).toHaveBeenCalledWith(postId);
    expect(NotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      workspaceId,
      userId: 'user-1',
      title: 'Post Publication Failed',
      type: 'ERROR',
      message: expect.stringContaining('Connector error')
    }));
  });
});
