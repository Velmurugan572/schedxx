// ==========================================
// Post Management Integration Tests (post.test.js)
// ==========================================

import request from 'supertest';
import app from '../app.js';
import prisma from '../database/prisma.js';

describe('Post Management API Endpoints', () => {
  let ownerToken;
  let memberToken;
  let workspaceId;
  let ownerUserId;
  let memberUserId;
  let postId;

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Workspace" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RefreshToken" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WorkspaceInvitation" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Post" CASCADE;');

    const ownerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'post_owner@sched.com',
        password: 'password123',
        firstName: 'Post',
        lastName: 'Owner'
      });

    ownerToken = ownerRes.body.data.accessToken;
    ownerUserId = ownerRes.body.data.user.id;
    workspaceId = ownerRes.body.data.workspaceId;

    const memberRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'post_member@sched.com',
        password: 'password123',
        firstName: 'Post',
        lastName: 'Member'
      });

    memberToken = memberRes.body.data.accessToken;
    memberUserId = memberRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a draft post for a workspace member', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Launch plan');
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('lists posts for a workspace member', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      });

    const res = await request(app)
      .get(`/api/v1/posts/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(createRes.body.data.id);
  });

  it('retrieves a single post and blocks non-members', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      });

    const readRes = await request(app)
      .get(`/api/v1/posts/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(readRes.body.success).toBe(true);
    expect(readRes.body.data.id).toBe(createRes.body.data.id);

    const blockedRes = await request(app)
      .get(`/api/v1/posts/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    expect(blockedRes.body.success).toBe(false);
  });

  it('updates a post only when the user is the author', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      });

    const res = await request(app)
      .patch(`/api/v1/posts/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated launch plan' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated launch plan');
  });

  it('blocks updates by non-authors', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      });

    const res = await request(app)
      .patch(`/api/v1/posts/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Attempted edit' })
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  it('deletes a post only when the user is the author', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      });

    await request(app)
      .delete(`/api/v1/posts/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const listRes = await request(app)
      .get(`/api/v1/posts/workspaces/${workspaceId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(listRes.body.data.length).toBe(0);
  });

  it('blocks deletion by non-authors', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        workspaceId,
        title: 'Launch plan',
        content: 'Draft content for Module 7'
      });

    const res = await request(app)
      .delete(`/api/v1/posts/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);

    expect(res.body.success).toBe(false);
  });
});
