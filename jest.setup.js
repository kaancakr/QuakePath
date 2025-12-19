// Mock React Native modules - Full mock to avoid TurboModuleRegistry issues
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
      Version: '15.0',
    },
    PermissionsAndroid: {
      requestMultiple: jest.fn(() => Promise.resolve({})),
      PERMISSIONS: {
        BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
        BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
      },
    },
    Settings: {
      get: jest.fn(),
      set: jest.fn(),
    },
    NativeModules: {},
    TurboModuleRegistry: {
      get: jest.fn(),
      getEnforcing: jest.fn(() => ({})),
    },
  };
});

// Mock expo modules
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 39.92077,
        longitude: 32.85411,
        accuracy: 10,
      },
    })
  ),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    state: jest.fn(() => Promise.resolve('PoweredOn')),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    cancelDeviceConnection: jest.fn(),
    discoverAllServicesAndCharacteristics: jest.fn(),
    readCharacteristicForDevice: jest.fn(),
    writeCharacteristicForDevice: jest.fn(),
    startAdvertising: jest.fn(),
    stopAdvertising: jest.fn(),
    onStateChange: jest.fn(() => ({
      remove: jest.fn(),
    })),
  })),
}));

jest.mock('react-native-base64', () => ({
  encode: jest.fn((str) => Buffer.from(str).toString('base64')),
  decode: jest.fn((str) => Buffer.from(str, 'base64').toString()),
}));

jest.mock('@rnmapbox/maps', () => ({
  setAccessToken: jest.fn(),
  MapView: 'MapView',
  Camera: 'Camera',
  LocationPuck: 'LocationPuck',
  MarkerView: 'MarkerView',
  ShapeSource: 'ShapeSource',
  LineLayer: 'LineLayer',
  VectorSource: 'VectorSource',
  SymbolLayer: 'SymbolLayer',
  UserLocation: 'UserLocation',
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    close: jest.fn(),
    id: 'mock-socket-id',
  })),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

