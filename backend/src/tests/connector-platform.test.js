// ==========================================
// Connector Platform Module 8 Tests
// ==========================================

import ConnectorFactory from '../connectors/factory/ConnectorFactory.js';
import InstagramConnector from '../connectors/social/InstagramConnector.js';
import LinkedInConnector from '../connectors/social/LinkedInConnector.js';
import XConnector from '../connectors/social/XConnector.js';
import OAuthService from '../services/OAuthService.js';
import TokenRefreshService from '../services/TokenRefreshService.js';
import HealthCheckService from '../services/HealthCheckService.js';

describe('Module 8 connector platform', () => {
  it('registers social connectors and resolves them by platform name', async () => {
    const instagram = ConnectorFactory.get('INSTAGRAM');
    const linkedin = ConnectorFactory.get('LINKEDIN');

    expect(instagram).toBeInstanceOf(InstagramConnector);
    expect(linkedin).toBeInstanceOf(LinkedInConnector);
    expect(ConnectorFactory.getRegisteredPlatforms()).toEqual(expect.arrayContaining(['INSTAGRAM', 'LINKEDIN', 'X']));
  });

  it('exposes the expected connector lifecycle methods', async () => {
    const connector = new XConnector();

    const connected = await connector.connect({ clientId: 'demo', clientSecret: 'demo' });
    const published = await connector.publish({ content: 'Hello from tests' }, { accessToken: 'valid-token' });
    const updated = await connector.update('post-1', { content: 'Updated' }, { accessToken: 'valid-token' });
    const deleted = await connector.delete('post-1', { accessToken: 'valid-token' });
    const analytics = await connector.analytics('post-1', { accessToken: 'valid-token' });
    const refreshed = await connector.refreshToken({ refreshToken: 'refresh-token' });
    const health = await connector.healthCheck({ accessToken: 'valid-token' });
    const disconnected = await connector.disconnect({ accessToken: 'valid-token' });

    expect(connected.connected).toBe(true);
    expect(published.success).toBe(true);
    expect(updated.success).toBe(true);
    expect(deleted.success).toBe(true);
    expect(analytics).toEqual(expect.arrayContaining([expect.objectContaining({ name: expect.any(String) })]));
    expect(refreshed.accessToken).toBeDefined();
    expect(health.status).toBe('healthy');
    expect(disconnected.connected).toBe(false);
  });

  it('builds OAuth authorization URLs and handles callback exchange', async () => {
    const oauthService = new OAuthService();
    const authResult = await oauthService.getAuthorizationUrl('instagram', {
      clientId: 'demo-client',
      redirectUri: 'https://example.com/callback'
    });

    expect(authResult.url).toContain('instagram');
    expect(authResult.state).toBeDefined();

    const callbackResult = await oauthService.handleCallback('instagram', { code: 'auth-code' });
    expect(callbackResult.success).toBe(true);
    expect(callbackResult.connected).toBe(true);
  });

  it('refreshes tokens and reports health through services', async () => {
    const tokenService = new TokenRefreshService();
    const healthService = new HealthCheckService();

    const refreshed = await tokenService.refreshToken('linkedin', { refreshToken: 'rt-1' });
    const health = await healthService.check('linkedin', { accessToken: 'valid' });

    expect(refreshed.accessToken).toBeDefined();
    expect(health.status).toBe('healthy');
  });
});
