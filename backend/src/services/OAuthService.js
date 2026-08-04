// =====================================================================
// OAuth Service (OAuthService.js)
// =====================================================================

import { randomUUID } from 'crypto';
import ConnectorFactory from '../connectors/factory/ConnectorFactory.js';

export class OAuthService {
  async getAuthorizationUrl(platformName, options = {}) {
    const platform = platformName.toUpperCase();
    const state = randomUUID();
    const url = `https://${platform.toLowerCase()}.sched.local/oauth/authorize?client_id=${options.clientId || 'demo-client'}&redirect_uri=${encodeURIComponent(options.redirectUri || 'https://example.com/callback')}&state=${state}`;

    return {
      platform,
      url,
      state,
      scope: options.scope || 'read write'
    };
  }

  async handleCallback(platformName, callbackData = {}) {
    const platform = platformName.toUpperCase();
    const connector = ConnectorFactory.get(platform);
    const connection = await connector.connect({
      accessToken: `oauth_${platform.toLowerCase()}_token`,
      refreshToken: `oauth_${platform.toLowerCase()}_refresh`
    });

    return {
      success: true,
      platform,
      connected: connection.connected,
      state: callbackData.state || 'mock-state',
      credentials: connection.credentials
    };
  }
}

export default OAuthService;
