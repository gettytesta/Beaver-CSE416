module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/tests/'
    ],
    testMatch: [
      '**/tests/**/*.test.js',
      '**/tests/**/*.spec.js'
    ],
    verbose: true
  };