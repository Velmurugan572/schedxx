// ==========================================
// Jest Testing Framework Configuration
// ==========================================

export default {
  // Use Node environment instead of browser environment
  testEnvironment: 'node',

  // Print detailed reports for each test execution
  verbose: true,

  // Stop testing execution immediately upon a single test failure
  bail: 1,

  // Files matching this glob pattern will be treated as test specs
  testMatch: [
    '**/src/tests/**/*.test.js',
    '**/tests/**/*.test.js'
  ],

  // Set timeout threshold to 10 seconds for asynchronous DB/API tests
  testTimeout: 10000,

  // Prevent Jest from trying to transform modern JS using old Babel transpiles
  transform: {}
};
