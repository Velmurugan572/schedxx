// ==========================================
// Facebook Connector (FacebookConnector.js)
// ==========================================

import OAuthConnector from '../base/OAuthConnector.js';
import ConnectorFactory from '../factory/ConnectorFactory.js';

export class FacebookConnector extends OAuthConnector {
  constructor(options = {}) {
    super('FACEBOOK', options);
  }
}

const facebookConnector = new FacebookConnector();
ConnectorFactory.register('FACEBOOK', facebookConnector);

export default FacebookConnector;
