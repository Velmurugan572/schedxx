// ==========================================
// Publisher Service Unit Tests (publisher.test.js)
// Verifies modular dispatches and error routing in isolation
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

// 2. Mock database repositories
jest.unstable_mockModule('../repositories/PublishRepository.js', () => {
  return {
    default: {
      findById: jest.fn(),
      updateDestinationStatus: jest.fn(),
      updateScheduleStatus: jest.fn(),
      updatePostStatus: jest.fn()
    }
  };
});

// 3. Mock ConnectorFactory
jest.unstable_mockModule('../connectors/factory/ConnectorFactory.js', () => {
  return {
    default: {
      get: jest.fn()
    }
  };
});

// 4. Mock RetryService and FailureHandler
jest.unstable_mockModule('../services/RetryService.js', () => {
  return {
    default: {
      handleRetry: jest.fn()
    }
  };
});

jest.unstable_mockModule('../services/FailureHandler.js', () => {
  return {
    default: {
      handleFailure: jest.fn()
    }
  };
});

// 5. Dynamically import dependencies after mocking
const { default: PublisherService } = await import('../services/PublisherService.js');
const { default: PublishRepository } = await import('../repositories/PublishRepository.js');
const { default: ConnectorFactory } = await import('../connectors/factory/ConnectorFactory.js');
const { default: RetryService } = await import('../services/RetryService.js');
const { default: FailureHandler } = await import('../services/FailureHandler.js');

describe('PublisherService (Isolated)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully publishes a post when connector succeeds', async () => {
    const mockSchedule = {
      id: 'schedule-1',
      postId: 'post-1',
      status: 'PENDING',
      post: { id: 'post-1', content: 'Hello social media!' },
      socialAccount: {
        id: 'social-1',
        integration: {
          accessToken: 'valid-token',
          platform: { code: 'x' }
        }
      },
      destinations: [{ id: 'destination-1', status: 'PENDING' }]
    };

    const mockConnector = {
      publish: jest.fn().mockResolvedValue({ success: true, itemId: 'ext-post-123', url: 'https://x.com/mock-post' })
    };

    PublishRepository.findById.mockResolvedValue(mockSchedule);
    ConnectorFactory.get.mockReturnValue(mockConnector);

    // Setup sequence for findById calls (initial fetch then final return object)
    const mockUpdatedSchedule = {
      ...mockSchedule,
      status: 'COMPLETED',
      destinations: [{ id: 'destination-1', status: 'PUBLISHED' }]
    };
    PublishRepository.findById.mockResolvedValueOnce(mockSchedule).mockResolvedValueOnce(mockUpdatedSchedule);

    const result = await PublisherService.publishPost('schedule-1');

    expect(result.success).toBe(true);
    expect(result.destination.status).toBe('PUBLISHED');
    expect(PublishRepository.updateScheduleStatus).toHaveBeenCalledWith('schedule-1', 'RUNNING');
    expect(PublishRepository.updateDestinationStatus).toHaveBeenCalledWith('destination-1', 'PUBLISHING');
    expect(mockConnector.publish).toHaveBeenCalledWith(
      { content: 'Hello social media!' },
      { accessToken: 'valid-token' }
    );
    expect(PublishRepository.updateDestinationStatus).toHaveBeenCalledWith('destination-1', 'PUBLISHED', {
      externalItemId: 'ext-post-123',
      externalItemUrl: 'https://x.com/mock-post'
    });
    expect(PublishRepository.updateScheduleStatus).toHaveBeenCalledWith('schedule-1', 'COMPLETED');
    expect(PublishRepository.updatePostStatus).toHaveBeenCalledWith('post-1', 'PUBLISHED');
  });

  it('rejects publishing and triggers FailureHandler if connector rejects call', async () => {
    const mockSchedule = {
      id: 'schedule-1',
      postId: 'post-1',
      status: 'PENDING',
      post: { id: 'post-1', content: 'Hello!' },
      socialAccount: {
        id: 'social-1',
        integration: {
          accessToken: 'valid-token',
          platform: { code: 'x' }
        }
      },
      destinations: [{ id: 'destination-1', status: 'PENDING' }]
    };

    const mockConnector = {
      publish: jest.fn().mockResolvedValue({ success: false, errorMessage: 'Rate limit exceeded' })
    };

    PublishRepository.findById.mockResolvedValue(mockSchedule);
    ConnectorFactory.get.mockReturnValue(mockConnector);

    await expect(PublisherService.publishPost('schedule-1')).rejects.toThrow('Rate limit exceeded');

    expect(FailureHandler.handleFailure).toHaveBeenCalledWith(
      'schedule-1',
      'destination-1',
      'post-1',
      expect.any(Error)
    );
  });

  it('rejects publishing and delegates to RetryService if run in a BullMQ job context', async () => {
    const mockSchedule = {
      id: 'schedule-1',
      postId: 'post-1',
      status: 'PENDING',
      post: { id: 'post-1', content: 'Hello!' },
      socialAccount: {
        id: 'social-1',
        integration: {
          accessToken: 'valid-token',
          platform: { code: 'x' }
        }
      },
      destinations: [{ id: 'destination-1', status: 'PENDING' }]
    };

    const mockConnector = {
      publish: jest.fn().mockRejectedValue(new Error('Network error'))
    };

    PublishRepository.findById.mockResolvedValue(mockSchedule);
    ConnectorFactory.get.mockReturnValue(mockConnector);

    const mockJob = { id: 'job-1', attemptsMade: 0, opts: { attempts: 3 } };

    await PublisherService.publishPost('schedule-1', mockJob);

    expect(RetryService.handleRetry).toHaveBeenCalledWith(
      mockJob,
      expect.any(Error),
      'schedule-1',
      'destination-1',
      'post-1'
    );
  });

  it('fails validation if X/Twitter post content exceeds 280 characters', async () => {
    const longContent = 'A'.repeat(281);
    const mockSchedule = {
      id: 'schedule-1',
      postId: 'post-1',
      status: 'PENDING',
      post: { id: 'post-1', content: longContent },
      socialAccount: {
        id: 'social-1',
        integration: {
          accessToken: 'valid-token',
          platform: { code: 'x' }
        }
      },
      destinations: [{ id: 'destination-1', status: 'PENDING' }]
    };

    PublishRepository.findById.mockResolvedValue(mockSchedule);

    await expect(PublisherService.publishPost('schedule-1')).rejects.toThrow(
      'Content exceeds character limit of 280 for X/Twitter.'
    );

    expect(FailureHandler.handleFailure).toHaveBeenCalledWith(
      'schedule-1',
      'destination-1',
      'post-1',
      expect.any(Error)
    );
  });
});
