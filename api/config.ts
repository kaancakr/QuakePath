/**
 * API Configuration
 * Base URL for the backend server
 */

import { Platform } from 'react-native';

/**
 * Get the appropriate API base URL based on the environment
 * - Android Emulator: Use 10.0.2.2 (maps to host's localhost)
 * - iOS Simulator: Use localhost
 * - Physical devices: Use environment variable or default IP
 */
const getApiBaseUrl = (): string => {
  // Priority 1: Environment variable (highest priority)
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('[API Config] Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  if (process.env.API_URL) {
    console.log('[API Config] Using API_URL:', process.env.API_URL);
    return process.env.API_URL;
  }

  // Priority 2: Emulator/Simulator detection
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      // If server is running on localhost:3000, use 10.0.2.2:3000
      // If server is on a remote IP, use that IP directly
      const url = 'http://10.0.2.2:3000';
      console.log('[API Config] Android emulator detected, using:', url);
      return url;
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      const url = 'http://localhost:3000';
      console.log('[API Config] iOS simulator detected, using:', url);
      return url;
    }
  }

  // Priority 3: Default (for physical devices or production)
  const url = 'http://92.44.28.45:3000';
  console.log('[API Config] Using default URL:', url);
  return url;
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  locations: '/api/locations',
  locationsByDevice: (deviceId: string) => `/api/locations/device/${deviceId}`,
  locationsRecent: '/api/locations/recent',
  civilianLocations: '/api/locations/civilians',
} as const;
