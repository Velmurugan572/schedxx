// ==========================================
// User Data Access Repository (UserRepository.js)
// ==========================================

import prisma from '../database/prisma.js';

export class UserRepository {
  /**
   * Creates a new user record
   * @param {Object} data - User creation payload
   * @returns {Promise<Object>} Created user
   */
  async create(data) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName
      }
    });
  }

  /**
   * Finds an active user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email) {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null
      }
    });
  }

  /**
   * Finds an active user by ID
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
  }

  /**
   * Updates user records
   * @param {string} id - User UUID
   * @param {Object} data - Update payloads
   * @returns {Promise<Object>} Updated user
   */
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  /**
   * Performs soft deletion on a user
   * @param {string} id - User UUID
   * @returns {Promise<Object>} Updated user
   */
  async delete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export default new UserRepository();
