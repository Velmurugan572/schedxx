// ==========================================
// Audit Log Business Logic Coordinator (AuditLogService.js)
// ==========================================

import AuditLogRepository from '../repositories/AuditLogRepository.js';
import { logger } from '../logger/index.js';

class AuditLogService {
  /**
   * Helper to write database audit trails and log to console system.
   * @param {Object} params
   * @param {string} params.workspaceId - Workspace UUID
   * @param {string} params.userId - User UUID
   * @param {string} params.action - Event action descriptor (e.g. "POST_CREATED")
   * @param {string} params.entityType - Database table/model targeted
   * @param {string} [params.entityId] - Targeted record identifier
   * @param {string} [params.ipAddress] - Client IP address
   * @param {string} [params.userAgent] - Client User Agent header
   * @param {Object} [params.metadata] - Extra metadata key-values
   */
  async logEvent({ workspaceId, userId, action, entityType, entityId, ipAddress, userAgent, metadata }) {
    try {
      const auditLog = await AuditLogRepository.create({
        workspaceId,
        userId,
        action,
        entityType,
        entityId,
        ipAddress,
        userAgent,
        metadata
      });
      logger.info(`[AUDIT] Action: ${action} | User: ${userId} | Workspace: ${workspaceId} | Entity: ${entityType}(${entityId})`);
      return auditLog;
    } catch (error) {
      // Catch audit log failures to prevent interrupting main request executions
      logger.error(`[AUDIT ERROR] Failed to write audit trail: ${error.message}`);
    }
  }
}

export default new AuditLogService();
