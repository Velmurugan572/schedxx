// ==========================================
// Media Engine Unit Tests (media.test.js)
// Verifies uploads, list, soft-delete, attach/detach workflows
// ==========================================

import { jest } from '@jest/globals';

const mockUserId = 'user-1';
const mockWorkspaceId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const mockPostId = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const mockPostIdDiff = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99';
const mockMediaId = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

// 1. Mock connection packages
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

// 2. Mock database repositories
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
        if ((workspaceId === mockWorkspaceId || workspaceId === 'other-workspace-id') && userId === mockUserId) {
          return Promise.resolve({ id: 'member-1', workspaceId, userId });
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
        if (id === mockPostIdDiff) {
          return Promise.resolve({ id: mockPostIdDiff, workspaceId: 'other-workspace-id' });
        }
        return Promise.resolve(null);
      })
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
      create: jest.fn().mockImplementation((data) => Promise.resolve({ id: mockMediaId, ...data })),
      findById: jest.fn().mockImplementation((id) => {
        if (id === mockMediaId) {
          return Promise.resolve({
            id: mockMediaId,
            workspaceId: mockWorkspaceId,
            userId: mockUserId,
            name: 'test-image.png',
            fileUrl: '/uploads/test-image.png',
            mimeType: 'image/png',
            fileSize: 1024
          });
        }
        return Promise.resolve(null);
      }),
      findByWorkspaceId: jest.fn().mockImplementation((workspaceId) => {
        if (workspaceId === mockWorkspaceId) {
          return Promise.resolve([{
            id: mockMediaId,
            workspaceId: mockWorkspaceId,
            userId: mockUserId,
            name: 'test-image.png',
            fileUrl: '/uploads/test-image.png',
            mimeType: 'image/png',
            fileSize: 1024
          }]);
        }
        return Promise.resolve([]);
      }),
      delete: jest.fn().mockImplementation((id) => Promise.resolve({ id, deletedAt: new Date() })),
      attachToPost: jest.fn().mockImplementation((postId, mediaAssetId, sortOrder) => Promise.resolve({
        id: 'pm-1',
        postId,
        mediaAssetId,
        sortOrder
      })),
      detachFromPost: jest.fn().mockImplementation((postId, mediaAssetId) => Promise.resolve({
        postId,
        mediaAssetId
      })),
      findAttachment: jest.fn().mockImplementation((postId, mediaAssetId) => {
        // Return null by default to test successful attach, stub individually for existing attachment tests
        return Promise.resolve(null);
      }),
      findPostAttachments: jest.fn().mockImplementation(() => Promise.resolve([]))
    }
  };
});

jest.unstable_mockModule('../repositories/AuditLogRepository.js', () => {
  return {
    default: {
      create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'audit-1', ...data })),
      findByWorkspaceId: jest.fn()
    }
  };
});

// 3. Mock Prisma Client
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
const { default: WorkspaceMemberRepository } = await import('../repositories/WorkspaceMemberRepository.js');
const { default: PostRepository } = await import('../repositories/PostRepository.js');
const { default: MediaRepository } = await import('../repositories/MediaRepository.js');
const { default: jwt } = await import('jsonwebtoken');
const { env } = await import('../config/env.js');

describe('Media Engine API Endpoints (Isolated)', () => {
  const mockToken = jwt.sign({ id: mockUserId }, env.jwtSecret);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/media/upload', () => {
    it('successfully uploads and registers an image media asset', async () => {
      const fileBuffer = Buffer.from('dummy file content');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${mockToken}`)
        .field('workspaceId', mockWorkspaceId)
        .attach('file', fileBuffer, { filename: 'test-image.png', contentType: 'image/png' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockMediaId);
      expect(res.body.data.mimeType).toBe('image/png');
    });

    it('rejects uploads for unsupported file types', async () => {
      const fileBuffer = Buffer.from('dummy file content');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${mockToken}`)
        .field('workspaceId', mockWorkspaceId)
        .attach('file', fileBuffer, { filename: 'test-doc.pdf', contentType: 'application/pdf' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only images and videos are allowed');
    });

    it('blocks upload if the user is not a member of the workspace', async () => {
      jest.spyOn(WorkspaceMemberRepository, 'findByWorkspaceAndUser').mockResolvedValueOnce(null);
      const fileBuffer = Buffer.from('dummy file content');

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${mockToken}`)
        .field('workspaceId', mockWorkspaceId)
        .attach('file', fileBuffer, { filename: 'test-image.png', contentType: 'image/png' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/media/workspaces/:workspaceId', () => {
    it('successfully lists media assets inside a workspace for a member', async () => {
      const res = await request(app)
        .get(`/api/v1/media/workspaces/${mockWorkspaceId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(mockMediaId);
    });

    it('blocks listing for unauthorized users', async () => {
      jest.spyOn(WorkspaceMemberRepository, 'findByWorkspaceAndUser').mockResolvedValueOnce(null);

      const res = await request(app)
        .get(`/api/v1/media/workspaces/${mockWorkspaceId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('successfully soft-deletes a media asset', async () => {
      const res = await request(app)
        .delete(`/api/v1/media/${mockMediaId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(MediaRepository.delete).toHaveBeenCalledWith(mockMediaId);
    });

    it('returns 404 if the media asset does not exist', async () => {
      jest.spyOn(MediaRepository, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/v1/media/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/media/attach', () => {
    it('successfully attaches a media asset to a draft post', async () => {
      const res = await request(app)
        .post('/api/v1/media/attach')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ postId: mockPostId, mediaAssetId: mockMediaId })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(MediaRepository.attachToPost).toHaveBeenCalledWith(mockPostId, mockMediaId, 0);
    });

    it('rejects attachment if post and asset are in different workspaces', async () => {
      const res = await request(app)
        .post('/api/v1/media/attach')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ postId: mockPostIdDiff, mediaAssetId: mockMediaId })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('belong to the same workspace');
    });
  });

  describe('POST /api/v1/media/detach', () => {
    it('successfully detaches a media asset from a post', async () => {
      jest.spyOn(MediaRepository, 'findAttachment').mockResolvedValueOnce({
        postId: mockPostId,
        mediaAssetId: mockMediaId
      });

      const res = await request(app)
        .post('/api/v1/media/detach')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ postId: mockPostId, mediaAssetId: mockMediaId })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(MediaRepository.detachFromPost).toHaveBeenCalledWith(mockPostId, mockMediaId);
    });

    it('returns 404 if the attachment does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/media/detach')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ postId: mockPostId, mediaAssetId: mockMediaId })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('is not attached to this post');
    });
  });
});
