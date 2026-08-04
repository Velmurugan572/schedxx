// ==========================================
// Integration Tests - Diagnostic Routers
// ==========================================

import request from 'supertest';
import app from '../app.js';

describe('Diagnostic API Routes Health Check', () => {
  
  // Test health check route
  it('GET /api/v1/health should return status 200 and success status', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.body.error).toBeNull();
  });

  // Test version check route
  it('GET /api/v1/version should return API version info', async () => {
    const res = await request(app)
      .get('/api/v1/version')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.apiVersion).toBe('1.0.0');
    expect(res.body.data.appVersion).toBe('1.0.0');
    expect(res.body.data.nodeVersion).toBeDefined();
    expect(res.body.error).toBeNull();
  });

  // Test 404 interceptor
  it('GET /non-existent-route should return status 404', async () => {
    const res = await request(app)
      .get('/api/v1/non-existent-route')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Endpoint [/api/v1/non-existent-route] not found');
  });
  
});
