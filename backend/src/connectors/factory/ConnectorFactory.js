// =====================================================================
// Dynamic Connector Registry Factory (ConnectorFactory.js)
// =====================================================================

import { logger } from '../../logger/index.js';
import ConnectorRegistry from '../registry/ConnectorRegistry.js';

export class ConnectorFactory {
  /**
   * Registers a connector instance to the factory registry
   * @param {string} platformName - Identifier (e.g., 'META', 'SENDGRID', 'AWS_S3')
   * @param {Object} connectorInstance - Instance of class extending BaseConnector
   */
  static register(platformName, connectorInstance) {
    const key = platformName.toUpperCase();
    ConnectorRegistry.register(key, connectorInstance);
    logger.debug(`Connector [${key}] successfully registered in factory.`);
  }

  /**
   * Resolves and returns a registered connector instance
   * @param {string} platformName - Target platform identifier
   * @returns {Object} Target BaseConnector instance
   */
  static get(platformName) {
    const key = platformName.toUpperCase();
    return ConnectorRegistry.get(key);
  }

  /**
   * Audits registered platforms list
   * @returns {string[]} List of registered keys
   */
  static getRegisteredPlatforms() {
    return ConnectorRegistry.getRegisteredPlatforms();
  }
}

export default ConnectorFactory;
