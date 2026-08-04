// ==========================================
// LinkedIn Connector (LinkedInConnector.js)
// ==========================================

import OAuthConnector from '../base/OAuthConnector.js';
import ConnectorFactory from '../factory/ConnectorFactory.js';

export class LinkedInConnector extends OAuthConnector {
  constructor(options = {}) {
    super('LINKEDIN', options);
  }
}

const linkedInConnector = new LinkedInConnector();
ConnectorFactory.register('LINKEDIN', linkedInConnector);

export default LinkedInConnector;
