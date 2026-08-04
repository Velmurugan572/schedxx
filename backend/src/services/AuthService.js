// ==========================================
// Authentication Service Logic (AuthService.js)
// Core security operations and token generation
// ==========================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import UserRepository from '../repositories/UserRepository.js';
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import WorkspaceRepository from '../repositories/WorkspaceRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import { AppError } from '../errors/AppError.js';

export class AuthService {
  /**
   * Registers a new user and provisions their default workspace
   * @param {Object} payload - User details
   * @returns {Promise<Object>} User details with authentication tokens
   */
  async register({ email, password, firstName, lastName }) {
    // 1. Check if user exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email address is already registered.', 400);
    }

    // 2. Hash security password credentials
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Persist new user entity
    const user = await UserRepository.create({
      email,
      passwordHash,
      firstName,
      lastName
    });

    // 4. Provision default Tenant Workspace
    const defaultWorkspace = await WorkspaceRepository.create({
      name: `${user.firstName}'s Workspace`
    });

    // 5. Establish Workspace Member mapping as OWNER
    await WorkspaceMemberRepository.create({
      workspaceId: defaultWorkspace.id,
      userId: user.id,
      role: 'OWNER'
    });

    // 6. Generate session credentials
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);

    // Clean user object for client response
    delete user.passwordHash;

    return {
      user,
      workspaceId: defaultWorkspace.id,
      accessToken,
      refreshToken
    };
  }

  /**
   * Logs in a user using credentials
   * @param {string} email - Email address
   * @param {string} password - Input password
   * @returns {Promise<Object>} User profile and credentials
   */
  async login(email, password) {
    // 1. Locate user profile
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    // 2. Compare password hashes
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    // 3. Generate auth tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);

    delete user.passwordHash;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  /**
   * Rotates tokens via Refresh Token session validation
   * @param {string} token - Cryptographic token
   * @returns {Promise<Object>} Transferred access and refresh tokens
   */
  async refreshSession(token) {
    // 1. Find token records
    const tokenRecord = await RefreshTokenRepository.findByToken(token);

    if (!tokenRecord) {
      throw new AppError('Session refresh token not found.', 401);
    }

    // 2. Detect reuse attacks / expired configurations
    if (tokenRecord.revokedAt) {
      // Revoke all other user sessions for safety since this indicates a token reuse attempt
      await RefreshTokenRepository.revokeAllByUserId(tokenRecord.userId);
      throw new AppError('Invalid session. Refresh token has been previously used and revoked.', 401);
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new AppError('Session token has expired. Please log in again.', 401);
    }

    const { user } = tokenRecord;
    if (!user || user.deletedAt) {
      throw new AppError('The user linked to this session does not exist.', 401);
    }

    // 3. Issue rotated tokens
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.issueRefreshToken(user.id);

    // 4. Invalidate (revoke) old token
    await RefreshTokenRepository.revoke(token);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Ends session and revokes the refresh token
   * @param {string} token - Cryptographic token
   */
  async logout(token) {
    const tokenRecord = await RefreshTokenRepository.findByToken(token);
    if (tokenRecord) {
      await RefreshTokenRepository.revoke(token);
    }
  }

  // ==========================================
  // Helper Cryptography Actions
  // ==========================================

  /**
   * Signs short-lived JWT Access Tokens
   * @param {Object} user - User entity
   * @returns {string} Signed JWT
   */
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: '15m' }
    );
  }

  /**
   * Signs long-lived Refresh Token mapping
   * @param {string} userId - User UUID
   * @returns {Promise<string>} Created cryptographic string token value
   */
  async issueRefreshToken(userId) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    await RefreshTokenRepository.create({
      userId,
      token,
      expiresAt
    });

    return token;
  }
}

export default new AuthService();
