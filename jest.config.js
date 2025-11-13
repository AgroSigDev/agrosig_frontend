const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {  // ← ¡CORREGIDO! con "s" al final
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
  },
  testMatch: [
    '<rootDir>/services/__tests__/**/*.test.js',
  ],
};

module.exports = createJestConfig(customJestConfig);