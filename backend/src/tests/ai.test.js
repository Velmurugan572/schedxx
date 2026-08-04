// ==========================================
// AI Engine Integration Tests (ai.test.js)
// Runs in complete isolation without Redis or DB servers
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

jest.unstable_mockModule('../repositories/WorkspaceMemberRepository.js', () => {
  return {
    default: {
      findByWorkspaceAndUser: jest.fn()
    }
  };
});

jest.unstable_mockModule('../repositories/AIHistoryRepository.js', () => {
  return {
    default: {
      createHistoryEntry: jest.fn(),
      findByWorkspaceId: jest.fn()
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

// 3. Dynamically import modules after registering mock modules
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: UserRepository } = await import('../repositories/UserRepository.js');
const { default: WorkspaceMemberRepository } = await import('../repositories/WorkspaceMemberRepository.js');
const { default: AIHistoryRepository } = await import('../repositories/AIHistoryRepository.js');
const { default: jwt } = await import('jsonwebtoken');
const { env } = await import('../config/env.js');

describe('AI Engine API Endpoints (Isolated)', () => {
  const mockUser = { id: 'user-1', email: 'user@sched.com', firstName: 'Test', lastName: 'User' };
  const mockToken = jwt.sign({ id: 'user-1' }, env.jwtSecret);
  const workspaceId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

  beforeEach(() => {
    jest.clearAllMocks();
    UserRepository.findById.mockResolvedValue(mockUser);
  });

  it('generates content for a workspace member using the mock Gemini config', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue({ id: 'member-1', workspaceId, userId: 'user-1' });
    AIHistoryRepository.createHistoryEntry.mockResolvedValue({
      id: 'history-1',
      workspaceId,
      userId: 'user-1',
      prompt: 'Write a launch post',
      response: '🚀 Launching today!',
      provider: 'GEMINI'
    });

    const res = await request(app)
      .post('/api/v1/ai/generate')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        workspaceId,
        prompt: 'Write a launch post',
        platform: 'linkedin',
        tone: 'professional'
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBeDefined();
    expect(res.body.data.historyEntry).toBeDefined();
    expect(res.body.data.historyEntry.provider).toBe('GEMINI');
  });

  it('rejects generation if parameters are missing or invalid', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        workspaceId,
        prompt: '',
        platform: 'invalid-platform'
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('blocks content generation for non-members of the workspace', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/ai/generate')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        workspaceId,
        prompt: 'Write a launch post',
        platform: 'linkedin',
        tone: 'professional'
      })
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  it('retrieves workspace history logs for a workspace member', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue({ id: 'member-1', workspaceId, userId: 'user-1' });
    AIHistoryRepository.findByWorkspaceId.mockResolvedValue([
      { id: 'history-1', prompt: 'productivity tips', response: '💡 Tip 1' }
    ]);

    const res = await request(app)
      .get(`/api/v1/ai/history/workspace/${workspaceId}`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].prompt).toBe('productivity tips');
  });

  it('blocks history retrieval for non-members of the workspace', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/ai/history/workspace/${workspaceId}`)
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(403);

    expect(res.body.success).toBe(false);
  });
});
