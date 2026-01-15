/**
 * Location Sync Hook
 * Automatically syncs location data to backend via API or mesh network
 * 
 * Behavior:
 * - If device has internet: sends location directly to API
 * - If device has no internet: sends location via mesh network to internet-connected device
 * - Receives location messages from other devices and forwards them if this device has internet
 */

import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useMeshNetwork, MeshMessage } from './useMeshNetwork';
import { useInternetConnectivity } from './useInternetConnectivity';
import { useAuth } from '@/context/AuthContext';
import {
  sendLocationToBackend,
  extractLocationFromMeshMessage,
  LocationData,
} from '@/api';

interface QueuedLocation {
  locationData: LocationData;
  timestamp: Date;
  attempts: number;
}

const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_ATTEMPTS = 3;
const QUEUE_RETRY_INTERVAL = 10000; // 10 seconds

/**
 * Hook for syncing location data with automatic internet/mesh fallback
 */
export const useLocationSync = () => {
  const { deviceId, sendMessage, onMessage, connectedDevices } = useMeshNetwork();
  const { isConnected: hasInternet, checkConnectivity } = useInternetConnectivity();
  const { user, userProfile } = useAuth();
  
  // Track which devices have internet (from status messages)
  const devicesWithInternetRef = useRef<Set<string>>(new Set());
  
  // Queue for locations that failed to send (will retry when internet is available)
  const locationQueueRef = useRef<QueuedLocation[]>([]);
  
  // Track processed location message IDs to avoid duplicates
  const processedLocationIdsRef = useRef<Set<string>>(new Set());

  /**
   * Send location directly to API
   */
  const sendLocationToAPI = useCallback(async (locationData: LocationData): Promise<boolean> => {
    try {
      console.log('[LocationSync] Attempting to send location to API:', {
        deviceId: locationData.deviceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      
      const result = await sendLocationToBackend(locationData);
      
      if (result.success) {
        console.log('[LocationSync] ✅ Location successfully sent to API:', {
          deviceId: locationData.deviceId,
          locationId: result.data?.id,
        });
        return true;
      } else {
        console.warn('[LocationSync] ❌ Failed to send location to API:', {
          deviceId: locationData.deviceId,
          error: result.error,
        });
        return false;
      }
    } catch (error: any) {
      console.error('[LocationSync] ❌ Exception sending location to API:', {
        deviceId: locationData.deviceId,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }, []);

  /**
   * Send location via mesh network to internet-connected device
   */
  const sendLocationViaMesh = useCallback((locationData: LocationData, targetDeviceId?: string) => {
    // Find a device with internet, or use the target device
    let recipientDeviceId = targetDeviceId;
    
    if (!recipientDeviceId) {
      // Find first device that has internet
      for (const device of connectedDevices) {
        if (devicesWithInternetRef.current.has(device.id)) {
          recipientDeviceId = device.id;
          break;
        }
      }
    }

    // If no specific recipient, broadcast to all (one will forward if they have internet)
    const message: MeshMessage = {
      id: `location-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: deviceId,
      recipient: recipientDeviceId,
      type: 'location',
      content: 'location_data',
      data: {
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          altitude: locationData.altitude,
          heading: locationData.heading,
          speed: locationData.speed,
        },
        needsForwarding: !hasInternet, // Flag indicating this needs to be forwarded to API
        originalDeviceId: locationData.deviceId,
      },
      ttl: 5,
      timestamp: locationData.timestamp || new Date().toISOString(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
      },
    };

    sendMessage(message.content, 'location', message.data);
    console.log('[LocationSync] Location sent via mesh network:', {
      deviceId: locationData.deviceId,
      recipient: recipientDeviceId || 'broadcast',
    });
  }, [deviceId, sendMessage, connectedDevices, hasInternet]);

  /**
   * Send location with automatic routing (API if online, mesh if offline)
   */
  const syncLocation = useCallback(async (locationData: LocationData) => {
    try {
      // Ensure deviceId is set and add user info if available
      const finalLocationData = {
        ...locationData,
        deviceId: locationData.deviceId || deviceId,
        userId: locationData.userId || user?.uid || undefined,
        userRole: locationData.userRole || userProfile?.role || undefined,
      };

      console.log('[LocationSync] syncLocation called:', {
        deviceId: finalLocationData.deviceId,
        hasInternet,
        latitude: finalLocationData.latitude,
        longitude: finalLocationData.longitude,
      });

      // Try API first if we think we have internet
      if (hasInternet) {
        // Try to send directly to API
        console.log('[LocationSync] Has internet, sending to API...');
        const success = await sendLocationToAPI(finalLocationData);
        
        if (success) {
          console.log('[LocationSync] Successfully sent location to API - no mesh backup needed');
          // Don't send via mesh if API succeeded - avoid duplicates
          return;
        } else {
          // If API fails, queue it and try mesh as fallback
          console.warn('[LocationSync] API failed, queuing location and trying mesh');
          locationQueueRef.current.push({
            locationData: finalLocationData,
            timestamp: new Date(),
            attempts: 0,
          });
          sendLocationViaMesh(finalLocationData);
        }
      } else {
        // No internet detected - send via mesh network
        console.log('[LocationSync] No internet detected, sending via mesh network');
        // But still try API in case connectivity check was wrong
        console.log('[LocationSync] Also attempting direct API call as fallback...');
        const apiSuccess = await sendLocationToAPI(finalLocationData);
        if (!apiSuccess) {
          // Only use mesh if API also fails
          sendLocationViaMesh(finalLocationData);
        } else {
          console.log('[LocationSync] API succeeded despite connectivity check - no mesh needed');
        }
      }
    } catch (error) {
      console.error('[LocationSync] Error in syncLocation:', error);
      throw error; // Re-throw so caller can handle it
    }
  }, [hasInternet, deviceId, sendLocationToAPI, sendLocationViaMesh]);

  /**
   * Process queued locations when internet becomes available
   */
  const processLocationQueue = useCallback(async () => {
    if (!hasInternet || locationQueueRef.current.length === 0) {
      return;
    }

    const queue = [...locationQueueRef.current];
    locationQueueRef.current = [];

    for (const queued of queue) {
      if (queued.attempts >= MAX_RETRY_ATTEMPTS) {
        console.warn('[LocationSync] Max retries reached for location, discarding');
        continue;
      }

      const success = await sendLocationToAPI(queued.locationData);
      if (!success) {
        // Re-queue with incremented attempts
        queued.attempts++;
        locationQueueRef.current.push(queued);
      }
    }

    // If queue still has items, schedule another retry
    if (locationQueueRef.current.length > 0) {
      setTimeout(processLocationQueue, QUEUE_RETRY_INTERVAL);
    }
  }, [hasInternet, sendLocationToAPI]);

  /**
   * Handle incoming mesh messages
   */
  useEffect(() => {
    const unsubscribe = onMessage(async (message: MeshMessage) => {
      // Handle status messages - track devices with internet
      if (message.type === 'status' && message.data?.hasInternet) {
        if (message.data.hasInternet) {
          devicesWithInternetRef.current.add(message.sender);
          console.log('[LocationSync] Device has internet:', message.sender);
        } else {
          devicesWithInternetRef.current.delete(message.sender);
        }
      }

      // Handle location messages that need forwarding
      if (message.type === 'location' && message.data?.needsForwarding) {
        // Check if we've already processed this location
        if (processedLocationIdsRef.current.has(message.id)) {
          return;
        }
        processedLocationIdsRef.current.add(message.id);

        // Only forward if we have internet
        if (hasInternet) {
          console.log('[LocationSync] Forwarding location from offline device:', message.sender);
          
          const locationData = extractLocationFromMeshMessage(message);
          if (locationData) {
            // Use original device ID from the message
            const originalDeviceId = message.data.originalDeviceId || message.sender;
            const forwardLocationData = {
              ...locationData,
              deviceId: originalDeviceId,
            };

            const success = await sendLocationToAPI(forwardLocationData);
            if (success) {
              console.log('[LocationSync] Successfully forwarded location to API');
            } else {
              console.warn('[LocationSync] Failed to forward location, will retry');
              // Re-queue for retry
              locationQueueRef.current.push({
                locationData: forwardLocationData,
                timestamp: new Date(),
                attempts: 0,
              });
            }
          }
        } else {
          // We don't have internet either - forward to another device that might
          console.log('[LocationSync] No internet, forwarding location to other devices');
          const locationData = extractLocationFromMeshMessage(message);
          if (locationData) {
            sendLocationViaMesh(locationData);
          }
        }
      }

      // Handle regular location messages (from devices with internet)
      if (message.type === 'location' && !message.data?.needsForwarding) {
        // Extract and save if we have internet (in case the sender didn't)
        if (hasInternet) {
          const locationData = extractLocationFromMeshMessage(message);
          if (locationData && !processedLocationIdsRef.current.has(message.id)) {
            processedLocationIdsRef.current.add(message.id);
            await sendLocationToAPI(locationData);
          }
        }
      }
    });

    return unsubscribe;
  }, [onMessage, hasInternet, sendLocationToAPI, sendLocationViaMesh]);

  /**
   * Process queue when internet becomes available
   */
  useEffect(() => {
    if (hasInternet) {
      processLocationQueue();
    }
  }, [hasInternet, processLocationQueue]);

  /**
   * Send status message with internet connectivity info
   */
  useEffect(() => {
    // Send status update when connectivity changes
    const statusMessage: MeshMessage = {
      id: `status-${Date.now()}`,
      sender: deviceId,
      type: 'status',
      content: hasInternet ? 'online_with_internet' : 'online_no_internet',
      data: {
        hasInternet,
        platform: Platform.OS,
      },
      ttl: 5,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
      },
    };

    // Send status update to connected devices
    if (connectedDevices.length > 0) {
      sendMessage(statusMessage.content, 'status', statusMessage.data);
    }
  }, [hasInternet, deviceId, connectedDevices.length, sendMessage]);

  /**
   * Cleanup: limit queue size
   */
  useEffect(() => {
    if (locationQueueRef.current.length > MAX_QUEUE_SIZE) {
      // Remove oldest entries
      locationQueueRef.current = locationQueueRef.current.slice(-MAX_QUEUE_SIZE);
    }
  }, [locationQueueRef.current.length]);

  return {
    syncLocation,
    hasInternet,
    queueSize: locationQueueRef.current.length,
    devicesWithInternet: Array.from(devicesWithInternetRef.current),
  };
};
