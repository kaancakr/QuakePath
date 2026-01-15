/**
 * Location API Client
 * Functions to send location data from mesh network to backend
 */

import { API_BASE_URL, API_ENDPOINTS } from './config';
import { LocationData, LocationResponse, ApiResponse } from './types';

/**
 * Send location data from mesh network device to backend
 * @param locationData - Location data from mesh network device
 * @returns Promise with API response
 */
export const sendLocationToBackend = async (
  locationData: LocationData
): Promise<ApiResponse<LocationResponse>> => {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.locations}`;
    console.log('[LocationAPI] Sending location to:', url);
    console.log('[LocationAPI] Location data:', {
      deviceId: locationData.deviceId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    console.log('[LocationAPI] Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('[LocationAPI] Response data:', data);

    if (!response.ok) {
      return {
        success: false,
        error: {
          error: data.error || 'Unknown error',
          message: data.message || 'Failed to save location',
          statusCode: response.status,
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('[LocationAPI] Error sending location:', error);
    return {
      success: false,
      error: {
        error: 'NetworkError',
        message: error.message || 'Failed to connect to server',
      },
    };
  }
};

/**
 * Get recent locations for a specific device
 * @param deviceId - Device identifier
 * @param limit - Maximum number of locations to return (default: 50)
 * @returns Promise with array of locations
 */
export const getDeviceLocations = async (
  deviceId: string,
  limit: number = 50
): Promise<ApiResponse<LocationResponse[]>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.locationsByDevice(deviceId)}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          error: data.error || 'Unknown error',
          message: data.message || 'Failed to fetch locations',
          statusCode: response.status,
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('[LocationAPI] Error fetching locations:', error);
    return {
      success: false,
      error: {
        error: 'NetworkError',
        message: error.message || 'Failed to connect to server',
      },
    };
  }
};

/**
 * Get recent locations from all devices
 * @param limit - Maximum number of locations to return (default: 100)
 * @returns Promise with array of locations
 */
export const getRecentLocations = async (
  limit: number = 100
): Promise<ApiResponse<LocationResponse[]>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.locationsRecent}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          error: data.error || 'Unknown error',
          message: data.message || 'Failed to fetch recent locations',
          statusCode: response.status,
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('[LocationAPI] Error fetching recent locations:', error);
    return {
      success: false,
      error: {
        error: 'NetworkError',
        message: error.message || 'Failed to connect to server',
      },
    };
  }
};

/**
 * Get civilian locations (for rescue teams)
 * @param latestOnly - If true, returns only latest location per user (default: true)
 * @param limit - Maximum number of locations to return (default: 1000)
 * @returns Promise with array of locations
 */
export const getCivilianLocations = async (
  latestOnly: boolean = true,
  limit: number = 1000
): Promise<ApiResponse<LocationResponse[]>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.civilianLocations}?latestOnly=${latestOnly}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          error: data.error || 'Unknown error',
          message: data.message || 'Failed to fetch civilian locations',
          statusCode: response.status,
        },
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error('[LocationAPI] Error fetching civilian locations:', error);
    return {
      success: false,
      error: {
        error: 'NetworkError',
        message: error.message || 'Failed to connect to server',
      },
    };
  }
};

/**
 * Helper function to extract location data from mesh message
 * @param meshMessage - Message from mesh network
 * @returns LocationData if message contains location, null otherwise
 */
export const extractLocationFromMeshMessage = (
  meshMessage: any
): LocationData | null => {
  // Check if message type is location
  if (meshMessage.type !== 'location') {
    return null;
  }

  // Extract location from data field
  const location = meshMessage.data?.location || meshMessage.data;
  
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return null;
  }

  return {
    deviceId: meshMessage.sender || meshMessage.deviceId || 'unknown',
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    altitude: location.altitude,
    heading: location.heading,
    speed: location.speed,
    timestamp: meshMessage.timestamp || new Date().toISOString(),
    metadata: {
      platform: meshMessage.deviceInfo?.platform,
      version: meshMessage.deviceInfo?.version,
      messageId: meshMessage.id,
      sender: meshMessage.sender,
    },
  };
};
