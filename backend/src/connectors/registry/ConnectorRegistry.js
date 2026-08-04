// =====================================================================
// Connector Registry (ConnectorRegistry.js)
// =====================================================================

export class ConnectorRegistry {
  static #registry = new Map();

  static register(platformName, connectorInstance) {
    const key = platformName.toUpperCase();
    this.#registry.set(key, connectorInstance);
    return connectorInstance;
  }

  static get(platformName) {
    const key = platformName.toUpperCase();
    const connector = this.#registry.get(key);

    if (!connector) {
      throw new Error(`Connector Error: Platform [${key}] is not registered in the connector registry.`);
    }

    return connector;
  }

  static has(platformName) {
    return this.#registry.has(platformName.toUpperCase());
  }

  static getRegisteredPlatforms() {
    return Array.from(this.#registry.keys()).sort();
  }

  static clear() {
    this.#registry.clear();
  }
}

export default ConnectorRegistry;
