/**
 * Example: Integrating Location API with Mesh Network
 * 
 * This file demonstrates how to automatically send location data
 * from mesh network messages to the backend PostgreSQL database.
 */

import { useMeshNetwork, MeshMessage } from '@/hooks/useMeshNetwork';
import { extractLocationFromMeshMessage, sendLocationToBackend } from '@/api';
import { useEffect } from 'react';

/**
 * Example hook that automatically saves location messages to backend
 */
export const useLocationSync = () => {
  const { onMessage, deviceId } = useMeshNetwork();

  useEffect(() => {
    const unsubscribe = onMessage(async (message: MeshMessage) => {
      // Only process location messages
      if (message.type === 'location') {
        console.log('[LocationSync] Received location message:', message);

        // Extract location data from mesh message
        const locationData = extractLocationFromMeshMessage(message);
        
        if (locationData) {
          try {
            // Send to backend
            const result = await sendLocationToBackend(locationData);
            
            if (result.success) {
              console.log('[LocationSync] Location saved to database:', result.data?.id);
            } else {
              console.error('[LocationSync] Failed to save location:', result.error);
            }
          } catch (error) {
            console.error('[LocationSync] Error sending location:', error);
          }
        } else {
          console.warn('[LocationSync] Could not extract location from message');
        }
      }
    });

    return unsubscribe;
  }, [onMessage, deviceId]);
};

/**
 * Example: Manually send current location
 */
export const sendCurrentLocation = async (
  latitude: number,
  longitude: number,
  deviceId: string,
  accuracy?: number
) => {
  const locationData = {
    deviceId,
    latitude,
    longitude,
    accuracy,
    timestamp: new Date().toISOString(),
    metadata: {
      platform: 'react-native',
      source: 'manual',
    },
  };

  const result = await sendLocationToBackend(locationData);
  return result;
};
