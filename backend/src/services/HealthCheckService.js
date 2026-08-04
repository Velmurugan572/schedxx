// =====================================================================
// Health Check Service (HealthCheckService.js)
// =====================================================================

import ConnectorFactory from '../connectors/factory/ConnectorFactory.js';

export class HealthCheckService {
  async check(platformName, credentials = {}) {
    const platform = platformName.toUpperCase();
    const connector = ConnectorFactory.get(platform);
    return connector.healthCheck(credentials);
  }
}

export default HealthCheckService;
