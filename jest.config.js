// @ts-check

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/**
 * @type {import('jest').Config}
 **/
const customJestConfig = {
  testRegex: '.*__tests__/.+\\.(test|spec)\\.tsx?$',
  bail: false,
  verbose: false,
  fakeTimers: {
    timerLimit: 1000,
  },
  cacheDirectory: '<rootDir>/tmp/jest',
  coverageDirectory: '<rootDir>/tmp/coverage',
  collectCoverageFrom: ['<rootDir>/**/*.{ts,tsx,js,jsx}'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tmp/'],
  // testEnvironment: 'jest-environment-jsdom',
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
