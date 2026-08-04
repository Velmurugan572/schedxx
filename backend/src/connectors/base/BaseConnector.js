// =====================================================================
// Base Abstract Connection Connector (BaseConnector.js)
// =====================================================================

export class BaseConnector {
  /**
   * Initialize generic connector metadata
   * @param {string} platformName - Identifier of platform (e.g., 'META', 'SENDGRID', 'AWS_S3')
   */
  constructor(platformName) {
    if (this.constructor === BaseConnector) {
      throw new Error('BaseConnector is an abstract class and cannot be instantiated directly.');
    }
    this.platformName = platformName.toUpperCase();
  }

  async connect(credentials) {
    throw new Error(`connect() method must be implemented by connector [${this.platformName}].`);
  }

  async disconnect(credentials) {
    throw new Error(`disconnect() method must be implemented by connector [${this.platformName}].`);
  }

  async publish(payload, credentials) {
    throw new Error(`publish() method must be implemented by connector [${this.platformName}].`);
  }

  async update(postId, payload, credentials) {
    throw new Error(`update() method must be implemented by connector [${this.platformName}].`);
  }

  async delete(postId, credentials) {
    throw new Error(`delete() method must be implemented by connector [${this.platformName}].`);
  }

  async analytics(postId, credentials) {
    throw new Error(`analytics() method must be implemented by connector [${this.platformName}].`);
  }

  async refreshToken(tokenData) {
    throw new Error(`refreshToken() method must be implemented by connector [${this.platformName}].`);
  }

  async healthCheck(credentials) {
    throw new Error(`healthCheck() method must be implemented by connector [${this.platformName}].`);
  }

  /**
   * Validates target credentials against the platform provider
   * @param {Object} credentials - Decrypted authorization credentials
   * @returns {Promise<boolean>} True if session connection is active
   */
  async validate(credentials) {
    throw new Error(`validate() method must be implemented by connector [${this.platformName}].`);
  }

  /**
   * Executes custom actions against the destination platform APIs
   * @param {string} action - Action task identifier (e.g., 'PUBLISH_POST', 'SEND_EMAIL', 'UPLOAD_FILE', 'CREATE_EVENT')
   * @param {Object} payload - Task parameter payload matching the action
   * @param {Object} credentials - Decrypted auth tokens
   * @returns {Promise<any>} Response results returned by target platform
   */
  async execute(action, payload, credentials) {
    throw new Error(`execute() method must be implemented by connector [${this.platformName}].`);
  }
}

export default BaseConnector;
