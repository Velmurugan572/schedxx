// ==========================================
// Audit Log Data Access Layer (AuditLogRepository.js)
// ==========================================

import { prisma } from '../database/prisma.js';

class AuditLogRepository {
  /**
   * Records a new audit event in the database.
   * @param {Object} data - Audit log payload
   * @returns {Promise<Object>} The persisted AuditLog record
   */
  async create(data) {
    return prisma.auditLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata || null
      }
    });
  }

  /**
   * Retrieves chronological audit logs for a workspace.
   * @param {string} workspaceId - Workspace UUID
   * @returns {Promise<Array>} List of workspace audit logs
   */
  async findByWorkspaceId(workspaceId) {
    return prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new AuditLogRepository();
