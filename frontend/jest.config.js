  module.exports = {
    testEnvironment: 'jsdom', // Use jsdom environment for frontend tests
    setupFilesAfterEnv: ["@testing-library/jest-dom"], // Extend Jest with Testing Library matchers
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
      "^@/(.*)$": "<rootDir>/src/$1", // Map @/ to the src folder
    },
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
    verbose: true,
  };