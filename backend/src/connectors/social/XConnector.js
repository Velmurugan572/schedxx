// ==========================================
// X (Twitter) Connector (XConnector.js)
// ==========================================

import OAuthConnector from '../base/OAuthConnector.js';
import ConnectorFactory from '../factory/ConnectorFactory.js';

export class XConnector extends OAuthConnector {
  constructor(options = {}) {
    super('X', options);
  }
}

const xConnector = new XConnector();
ConnectorFactory.register('X', xConnector);

export default XConnector;
