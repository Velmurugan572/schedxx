// ==========================================
// Authentication Integration Tests (auth.test.js)
// ==========================================

import request from 'supertest';
import app from '../app.js';
import prisma from '../database/prisma.js';

describe('Authentication API Endpoints', () => {
  
  // Truncate dependent database tables before each test
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Workspace" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RefreshToken" CASCADE;');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    const registerPayload = {
      email: 'test_user@sched.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should register a new user, create a default workspace, and return access/refresh tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(registerPayload.email);
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Verify password hash is stripped
      expect(res.body.data.workspaceId).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();

      // Verify user was inserted into DB
      const userInDb = await prisma.user.findUnique({ where: { email: registerPayload.email } });
      expect(userInDb).toBeDefined();

      // Verify workspace member was added as OWNER
      const member = await prisma.workspaceMember.findFirst({
        where: { userId: userInDb.id, workspaceId: res.body.data.workspaceId }
      });
      expect(member.role).toBe('OWNER');
    });

    it('should fail registration if email is already taken', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload);

      // Second registration with duplicate email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email address is already registered');
    });

    it('should fail registration if validation parameters are missing or invalid', async () => {
      const invalidPayload = {
        email: 'bad-email',
        password: '123', // Too short
        firstName: '',
        lastName: 'User'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a default user to test login
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'auth_login@sched.com',
          password: 'password123',
          firstName: 'Auth',
          lastName: 'Login'
        });
    });

    it('should authenticate user and return access/refresh tokens with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth_login@sched.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject login for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth_login@sched.com',
          password: 'wrong_password'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'refresh_test@sched.com',
          password: 'password123',
          firstName: 'Refresh',
          lastName: 'Test'
        });
      
      refreshToken = res.body.data.refreshToken;
      userId = res.body.data.user.id;
    });

    it('should rotate access and refresh tokens on valid request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // Confirm token rotation

      // Verify old token is revoked
      const oldToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      expect(oldToken.revokedAt).not.toBeNull();
    });

    it('should reject refresh request if token is invalid or missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'non-existent-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let refreshToken;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'logout_test@sched.com',
          password: 'password123',
          firstName: 'Logout',
          lastName: 'Test'
        });
      refreshToken = res.body.data.refreshToken;
    });

    it('should invalidate token session upon logout', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Verify token is revoked in DB
      const oldToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      expect(oldToken.revokedAt).not.toBeNull();

      // Verify refresh attempts fail now
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('GET /api/v1/users/me (Protected)', () => {
    let accessToken;
    let email = 'protected_test@sched.com';

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          firstName: 'Protected',
          lastName: 'Test'
        });
      accessToken = res.body.data.accessToken;
    });

    it('should return user profile details when valid bearer token is sent', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
    });

    it('should return 401 Unauthorized if Authorization header is missing', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized if JWT token is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
