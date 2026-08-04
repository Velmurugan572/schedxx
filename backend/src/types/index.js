// =====================================================================
// Shared Constants & Type Metadata Declarations (index.js)
// =====================================================================

/**
 * Supported User Roles inside Workspaces
 */
export const UserRole = Object.freeze({
  OWNER: 'OWNER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
});

/**
 * Queue Task States for Post Schedules
 */
export const PostStatus = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  QUEUED: 'QUEUED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
});

/**
 * Integratable Online Content Platforms
 */
export const Platform = Object.freeze({
  META: 'META',
  LINKEDIN: 'LINKEDIN',
  X: 'X',
  YOUTUBE: 'YOUTUBE'
});

/**
 * Task Queue Names
 */
export const QueueName = Object.freeze({
  PUBLISH: 'publish-queue',
  TOKEN_REFRESH: 'token-refresh-queue'
});
