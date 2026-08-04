// ==========================================
// Workspace Integration Tests (workspace.test.js)
// ==========================================

import request from 'supertest';
import app from '../app.js';
import prisma from '../database/prisma.js';

describe('Workspace API Endpoints & Authorization (RBAC)', () => {
  let userA, userB, userC;
  let tokenA, tokenB, tokenC;
  let workspaceAId;

  // Setup test environment database and users
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Workspace" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RefreshToken" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkspaceInvitation" CASCADE;');

    // 1. Create User A (Owner of workspace A)
    const registerARes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'usera@sched.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'A'
      });
    userA = registerARes.body.data.user;
    tokenA = registerARes.body.data.accessToken;
    workspaceAId = registerARes.body.data.workspaceId;

    // 2. Create User B (Independent user)
    const registerBRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'userb@sched.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'B'
      });
    userB = registerBRes.body.data.user;
    tokenB = registerBRes.body.data.accessToken;

    // 3. Create User C (Pending invited user)
    const registerCRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'userc@sched.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'C'
      });
    userC = registerCRes.body.data.user;
    tokenC = registerCRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/workspaces (Create)', () => {
    it('should create a workspace and set the creator as OWNER', async () => {
      const res = await request(app)
        .post('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Alpha Workspace' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.workspace.name).toBe('Alpha Workspace');
      expect(res.body.data.member.role).toBe('OWNER');
    });
  });

  describe('GET /api/v1/workspaces (List)', () => {
    it('should list all workspaces the user is a member of', async () => {
      const res = await request(app)
        .get('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(workspaceAId);
    });
  });

  describe('GET /api/v1/workspaces/:id (Read)', () => {
    it('should allow workspace access to members', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(workspaceAId);
    });

    it('should block access with 403 Forbidden for non-members', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not a member of this workspace');
    });
  });

  describe('PATCH /api/v1/workspaces/:id (Update)', () => {
    it('should allow workspace name updates by OWNER', async () => {
      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Updated Workspace Name' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Workspace Name');
    });

    it('should block workspace updates by non-owners/non-admins', async () => {
      // Add User B as a standard MEMBER of Workspace A
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspaceAId,
          userId: userB.id,
          role: 'MEMBER'
        }
      });

      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hack Name' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/workspaces/:id (Soft Delete)', () => {
    it('should allow soft deletes exclusively by OWNER role', async () => {
      await request(app)
        .delete(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // Verify workspace is flagged as deleted
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceAId } });
      expect(workspace.deletedAt).not.toBeNull();

      // Verify it is excluded from find operations
      const listRes = await request(app)
        .get('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
      expect(listRes.body.data.length).toBe(0);
    });

    it('should reject workspace deletes by ADMIN role', async () => {
      // Add User B as ADMIN of Workspace A
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspaceAId,
          userId: userB.id,
          role: 'ADMIN'
        }
      });

      const res = await request(app)
        .delete(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/workspaces/:id/invitations (Invite)', () => {
    it('should allow OWNER to invite user B as EDITOR', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/invitations`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'userb@sched.com', role: 'EDITOR' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.email).toBe('userb@sched.com');
      expect(res.body.data.role).toBe('EDITOR');
    });

    it('should block invites if user is already a member', async () => {
      // Add User B as member
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspaceAId,
          userId: userB.id,
          role: 'MEMBER'
        }
      });

      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/invitations`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'userb@sched.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already a member');
    });
  });

  describe('POST /api/v1/workspaces/invitations/:token/accept (Accept)', () => {
    let invitationToken;

    beforeEach(async () => {
      // User A invites User C
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/invitations`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'userc@sched.com', role: 'ADMIN' });
      
      invitationToken = res.body.data.token;
    });

    it('should accept workspace invitation and create membership mapping', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/invitations/${invitationToken}/accept`)
        .set('Authorization', `Bearer ${tokenC}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(workspaceAId);

      // Verify User C is now ADMIN inside DB
      const member = await prisma.workspaceMember.findFirst({
        where: { userId: userC.id, workspaceId: workspaceAId }
      });
      expect(member.role).toBe('ADMIN');

      // Verify invitation is marked accepted
      const invite = await prisma.workspaceInvitation.findUnique({ where: { token: invitationToken } });
      expect(invite.acceptedAt).not.toBeNull();
    });

    it('should fail invitation acceptance if user B attempts to accept user C invitation', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/invitations/${invitationToken}/accept`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('belongs to a different email');
    });
  });

  describe('POST /api/v1/workspaces/invitations/:token/decline (Decline)', () => {
    let invitationToken;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/invitations`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'userc@sched.com' });
      invitationToken = res.body.data.token;
    });

    it('should decline invitation and delete the invitation record', async () => {
      await request(app)
        .post(`/api/v1/workspaces/invitations/${invitationToken}/decline`)
        .set('Authorization', `Bearer ${tokenC}`)
        .expect(200);

      const invite = await prisma.workspaceInvitation.findUnique({ where: { token: invitationToken } });
      expect(invite).toBeNull();
    });
  });
});
