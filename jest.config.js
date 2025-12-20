module.exports = {
  preset: 'jest-expo',
  
  // Cache ayarları
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Transform ignore - sadece gerekli modülleri transform et
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@rnmapbox/maps)',
  ],
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Test dosyalarını bul
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  
  // Timeout
  testTimeout: 15000,
  
  // Worker sayısı
  maxWorkers: 1,
  
  // Verbose
  verbose: true,
  
  // Coverage
  collectCoverage: false,
  
  // Test environment - node kullan (daha hızlı)
  testEnvironment: 'node',
  
  // Process handling
  forceExit: true,
  detectOpenHandles: true,
  
  // Clear mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

