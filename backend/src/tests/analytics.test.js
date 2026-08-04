// ==========================================
// Analytics Engine Unit Tests (analytics.test.js)
// Verifies metrics synchronization and query APIs in isolation
// ==========================================

import { jest } from '@jest/globals';

const mockUserId = 'user-1';
const mockWorkspaceId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const mockPostId = 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const mockDestinationId = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00';

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

// 2. Mock database repositories with default mock implementations
jest.unstable_mockModule('../repositories/UserRepository.js', () => {
  return {
    default: {
      findById: jest.fn().mockImplementation(() => Promise.resolve({
        id: mockUserId,
        email: 'user@sched.com',
        firstName: 'Test',
        lastName: 'User'
      }))
    }
  };
});

jest.unstable_mockModule('../repositories/WorkspaceMemberRepository.js', () => {
  return {
    default: {
      findByWorkspaceAndUser: jest.fn().mockImplementation((workspaceId, userId) => {
        // Return active member if IDs match and it's not a mocked block test
        if (workspaceId === mockWorkspaceId && userId === mockUserId) {
          return Promise.resolve({ id: 'member-1', workspaceId, userId });
        }
        return Promise.resolve(null);
      })
    }
  };
});

jest.unstable_mockModule('../repositories/PublishRepository.js', () => {
  return {
    default: {
      findDestinationById: jest.fn().mockImplementation((id) => {
        if (id === mockDestinationId) {
          return Promise.resolve({
            id: mockDestinationId,
            postId: mockPostId,
            socialAccountId: 'social-1',
            externalItemId: 'ext-item-1',
            post: { workspaceId: mockWorkspaceId },
            socialAccount: {
              id: 'social-1',
              integration: {
                accessToken: 'valid-token',
                platform: { code: 'x' }
              }
            }
          });
        }
        return Promise.resolve(null);
      })
    }
  };
});

jest.unstable_mockModule('../repositories/PostRepository.js', () => {
  return {
    default: {
      findById: jest.fn().mockImplementation((id) => {
        if (id === mockPostId) {
          return Promise.resolve({ id: mockPostId, workspaceId: mockWorkspaceId });
        }
        return Promise.resolve(null);
      })
    }
  };
});

jest.unstable_mockModule('../repositories/AnalyticsRepository.js', () => {
  return {
    default: {
      createMetric: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'metric-1', ...data })),
      findByPostId: jest.fn().mockImplementation(() => Promise.resolve([
        { id: 'metric-1', metricName: 'reach', metricValue: 300 }
      ])),
      findByWorkspaceId: jest.fn().mockImplementation(() => Promise.resolve([
        { id: 'metric-1', metricName: 'reach', metricValue: 300 }
      ])),
      findHistoricalMetrics: jest.fn().mockImplementation(() => Promise.resolve([
        { id: 'metric-1', metricName: 'reach', metricValue: 300 }
      ]))
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

// 3. Mock ConnectorFactory
jest.unstable_mockModule('../connectors/factory/ConnectorFactory.js', () => {
  return {
    default: {
      get: jest.fn().mockReturnValue({
        analytics: jest.fn().mockResolvedValue([
          { name: 'impressions', value: 1500 },
          { name: 'engagement', value: 120 }
        ])
      })
    }
  };
});

// 4. Mock Prisma Client
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

// 5. Dynamically import modules after registering mock modules
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: UserRepository } = await import('../repositories/UserRepository.js');
const { default: WorkspaceMemberRepository } = await import('../repositories/WorkspaceMemberRepository.js');
const { default: PublishRepository } = await import('../repositories/PublishRepository.js');
const { default: PostRepository } = await import('../repositories/PostRepository.js');
const { default: AnalyticsRepository } = await import('../repositories/AnalyticsRepository.js');
const { default: jwt } = await import('jsonwebtoken');
const { env } = await import('../config/env.js');

describe('Analytics Engine API Endpoints (Isolated)', () => {
  const mockToken = jwt.sign({ id: mockUserId }, env.jwtSecret);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully synchronizes analytics metrics for a workspace member', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/sync')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ destinationId: mockDestinationId })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].metricName).toBe('impressions');
    expect(AnalyticsRepository.createMetric).toHaveBeenCalledTimes(2);
  });

  it('rejects sync if parameters are missing or invalid', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/sync')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ destinationId: 'invalid-uuid' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('blocks metrics synchronization for non-members of the workspace', async () => {
    // Override the mock to simulate non-membership for this test block
    jest.spyOn(WorkspaceMemberRepository, 'findByWorkspaceAndUser').mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/v1/analytics/sync')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ destinationId: mockDestinationId })
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  it('retrieves post analytics for a workspace member', async () => {
    const res = await request(app)
      .get(`/api/v1/analytics/posts/${mockPostId}`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].metricName).toBe('reach');
  });

  it('retrieves workspace analytics for a workspace member', async () => {
    const res = await request(app)
      .get(`/api/v1/analytics/workspaces/${mockWorkspaceId}`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('retrieves chronological historical analytics for a workspace member', async () => {
    const res = await request(app)
      .get(`/api/v1/analytics/workspaces/${mockWorkspaceId}/history`)
      .set('Authorization', `Bearer ${mockToken}`)
      .query({ metricName: 'reach' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(AnalyticsRepository.findHistoricalMetrics).toHaveBeenCalledWith(mockWorkspaceId, 'reach');
  });
});
