// =====================================================================
// Token Refresh Service (TokenRefreshService.js)
// =====================================================================

import ConnectorFactory from '../connectors/factory/ConnectorFactory.js';

export class TokenRefreshService {
  async refreshToken(platformName, tokenData = {}) {
    const platform = platformName.toUpperCase();
    const connector = ConnectorFactory.get(platform);
    return connector.refreshToken(tokenData);
  }
}

export default TokenRefreshService;
