/**
 * Location Sync Provider
 * Automatically syncs user location to backend via API or mesh network
 * This component should be added to the app root to enable automatic location syncing
 */

import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';
import { useLocationSync } from '@/hooks/useLocationSync';

interface LocationSyncProviderProps {
  children: React.ReactNode;
  syncInterval?: number; // Interval in milliseconds (default: 1800000 = 30 minutes)
  enabled?: boolean; // Enable/disable location syncing
}

/**
 * Provider component that automatically syncs location data
 * 
 * Usage:
 * ```tsx
 * <LocationSyncProvider>
 *   <App />
 * </LocationSyncProvider>
 * ```
 */
export const LocationSyncProvider: React.FC<LocationSyncProviderProps> = ({
  children,
  syncInterval = 1800000, // 30 minutes default (30 * 60 * 1000 = 1800000 ms)
  enabled = true,
}) => {
  const { syncLocation, hasInternet, queueSize } = useLocationSync();
  
  // Use ref to store latest syncLocation to avoid dependency issues
  const syncLocationRef = useRef(syncLocation);
  useEffect(() => {
    syncLocationRef.current = syncLocation;
  }, [syncLocation]);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: NodeJS.Timeout | null = null;
    let isActive = true;
    let isSyncing = false; // Prevent concurrent syncs

    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('[LocationSyncProvider] Location permission not granted');
          return false;
        }
        return true;
      } catch (error) {
        console.error('[LocationSyncProvider] Error requesting location permission:', error);
        return false;
      }
    };

    const syncCurrentLocation = async () => {
      if (!isActive || isSyncing) {
        console.log('[LocationSyncProvider] Skipping sync - already in progress or inactive');
        return;
      }

      isSyncing = true;
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          isSyncing = false;
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        await syncLocationRef.current({
          deviceId: '', // Will be set by the hook
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          altitude: location.coords.altitude || undefined,
          heading: location.coords.heading || undefined,
          speed: location.coords.speed || undefined,
          timestamp: new Date().toISOString(),
          metadata: {
            platform: Platform.OS,
            version: Platform.Version,
            source: 'automatic_sync',
          },
        });

        console.log('[LocationSyncProvider] Location synced:', {
          hasInternet,
          queueSize,
        });
      } catch (error) {
        console.error('[LocationSyncProvider] Error syncing location:', error);
      } finally {
        isSyncing = false;
      }
    };

    // Initial sync (with delay to avoid immediate sync on mount)
    const initialTimeout = setTimeout(() => {
      if (isActive) {
        syncCurrentLocation();
      }
    }, 2000); // 2 second delay

    // Set up periodic syncing
    if (syncInterval > 0) {
      intervalId = setInterval(() => {
        if (isActive && !isSyncing) {
          syncCurrentLocation();
        }
      }, syncInterval);
    }

    return () => {
      isActive = false;
      clearTimeout(initialTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled, syncInterval]); // Removed syncLocation, hasInternet, queueSize from dependencies to prevent re-runs

  return <>{children}</>;
};
