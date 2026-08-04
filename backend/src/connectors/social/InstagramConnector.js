// ==========================================
// Instagram Connector (InstagramConnector.js)
// ==========================================

import OAuthConnector from '../base/OAuthConnector.js';
import ConnectorFactory from '../factory/ConnectorFactory.js';

export class InstagramConnector extends OAuthConnector {
  constructor(options = {}) {
    super('INSTAGRAM', options);
  }
}

const instagramConnector = new InstagramConnector();
ConnectorFactory.register('INSTAGRAM', instagramConnector);

export default InstagramConnector;
