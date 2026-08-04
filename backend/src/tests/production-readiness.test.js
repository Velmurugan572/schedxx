import { jest } from '@jest/globals';

// 1. Mock connection packages
jest.unstable_mockModule('ioredis', () => {
  return {
    default: class {
      constructor() {
        this.status = 'ready';
      }
      on() {}
      ping() {
        return Promise.resolve('PONG');
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

// 2. Mock database repositories
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

jest.unstable_mockModule('../repositories/WorkspaceRepository.js', () => {
  return {
    default: {
      findAllByUserId: jest.fn()
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
      create: jest.fn()
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
      create: jest.fn()
    }
  };
});

// Mock AuditLogRepository
jest.unstable_mockModule('../repositories/AuditLogRepository.js', () => {
  return {
    default: {
      create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'audit-1', ...data })),
      findByWorkspaceId: jest.fn().mockImplementation(() => Promise.resolve([]))
    }
  };
});

// 3. Mock Prisma Client (prevent database connection errors on bootstrap)
jest.unstable_mockModule('../database/prisma.js', () => {
  const mockPrisma = {
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $queryRaw: jest.fn().mockResolvedValue([1]),
    $disconnect: jest.fn().mockResolvedValue()
  };
  return {
    prisma: mockPrisma,
    default: mockPrisma
  };
});

// Import modules
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { prisma } = await import('../database/prisma.js');
const { default: redis } = await import('../config/redis.js');
const { default: env } = await import('../config/env.js');
const { default: AuditLogService } = await import('../services/AuditLogService.js');
const { default: AuditLogRepository } = await import('../repositories/AuditLogRepository.js');

describe('Production Readiness Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CORS Constraints', () => {
    it('allows requests with empty origin (e.g. system curl or mobile apps)', async () => {
      // Temporarily override allowedOrigins config
      env.allowedOrigins = ['http://trusted.com'];

      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('blocks requests from untrusted origins', async () => {
      env.allowedOrigins = ['http://trusted.com'];

      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://untrusted.com')
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('CORS');
    });

    it('allows requests from trusted origins', async () => {
      env.allowedOrigins = ['http://trusted.com'];

      const res = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://trusted.com')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Health and Readiness Endpoint', () => {
    it('returns 200 OK and UP status when both DB and Redis are responsive', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([1]);
      jest.spyOn(redis, 'ping').mockResolvedValueOnce('PONG');

      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('UP');
      expect(res.body.data.services.database).toBe('UP');
      expect(res.body.data.services.cache).toBe('UP');
    });

    it('returns 503 Service Unavailable when the database is offline', async () => {
      jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('DB Timeout'));
      jest.spyOn(redis, 'ping').mockResolvedValueOnce('PONG');

      const res = await request(app)
        .get('/api/v1/health')
        .expect(503);

      expect(res.body.success).toBe(false);
      expect(res.body.data.status).toBe('DOWN');
      expect(res.body.data.services.database).toBe('DOWN');
      expect(res.body.data.services.cache).toBe('UP');
    });

    it('returns 503 Service Unavailable when Redis is offline', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([1]);
      jest.spyOn(redis, 'ping').mockRejectedValueOnce(new Error('Redis Timeout'));

      const res = await request(app)
        .get('/api/v1/health')
        .expect(503);

      expect(res.body.success).toBe(false);
      expect(res.body.data.status).toBe('DOWN');
      expect(res.body.data.services.database).toBe('UP');
      expect(res.body.data.services.cache).toBe('DOWN');
    });
  });

  describe('Audit Logging System', () => {
    it('successfully calls AuditLogRepository to record mutated actions', async () => {
      const auditPayload = {
        workspaceId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        userId: 'user-1',
        action: 'POST_CREATED',
        entityType: 'Post',
        entityId: 'post-1'
      };

      await AuditLogService.logEvent(auditPayload);

      expect(AuditLogRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId: auditPayload.workspaceId,
        userId: auditPayload.userId,
        action: auditPayload.action,
        entityType: auditPayload.entityType,
        entityId: auditPayload.entityId
      }));
    });
  });
});
