// Basit Jest konfigürasyonu - Jest-expo olmadan
// Sadece unit testleri için (React Native bağımlılığı olmayan)

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Test dosyalarını bul - sadece unit testleri
  testMatch: ['**/__tests__/**/*.test.ts'],
  
  // Transform
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  
  // Timeout
  testTimeout: 5000,
  
  // Worker
  maxWorkers: 1,
  
  // Verbose
  verbose: true,
  
  // Coverage
  collectCoverage: false,
  
  // Process handling
  forceExit: true,
  detectOpenHandles: true,
};

