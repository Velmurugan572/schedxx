// Secure storage wrapper utility
// In a production Expo application, this would use expo-secure-store.
// Here we implement an in-memory fallback to guarantee crash-free operations in test suites or standard mock environments.

const store = new Map();

export const storage = {
  async setItem(key, value) {
    store.set(key, value);
    return true;
  },

  async getItem(key) {
    return store.get(key) || null;
  },

  async removeItem(key) {
    store.delete(key);
    return true;
  },

  async clear() {
    store.clear();
    return true;
  }
};

export default storage;
