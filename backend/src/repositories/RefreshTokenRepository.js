// ==========================================
// Session Refresh Token Data Repository (RefreshTokenRepository.js)
// ==========================================

import prisma from '../database/prisma.js';

export class RefreshTokenRepository {
  /**
   * Creates a new refresh token session mapping
   * @param {Object} data - Token payload parameters
   * @returns {Promise<Object>} Created token record
   */
  async create({ userId, token, expiresAt }) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  }

  /**
   * Finds a token and its linked user details
   * @param {string} token - Cryptographic token string
   * @returns {Promise<Object|null>} Token record with user or null
   */
  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });
  }

  /**
   * Revokes a refresh token
   * @param {string} token - Cryptographic token string
   * @returns {Promise<Object>} Revoked token record
   */
  async revoke(token) {
    return prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() }
    });
  }

  /**
   * Revokes all refresh tokens belonging to a user
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Batch payload details
   */
  async revokeAllByUserId(userId) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  /**
   * Deletes expired sessions
   * @returns {Promise<Object>} Batch delete count
   */
  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } }
        ]
      }
    });
  }
}

export default new RefreshTokenRepository();
