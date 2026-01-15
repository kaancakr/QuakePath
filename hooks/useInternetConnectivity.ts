/**
 * Internet Connectivity Hook
 * Checks if device has internet connectivity by testing API endpoint
 */

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/api/config';

interface ConnectivityState {
  isConnected: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
}

/**
 * Hook to check internet connectivity
 * Tests actual API connectivity, not just network state
 */
export const useInternetConnectivity = (checkInterval: number = 60000) => {
  const [connectivity, setConnectivity] = useState<ConnectivityState>({
    isConnected: false,
    isChecking: false,
    lastCheck: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Test internet connectivity by making a HEAD request to the API
   */
  const checkConnectivity = async (): Promise<boolean> => {
    try {
      setConnectivity((prev) => ({ ...prev, isChecking: true }));

      const url = `${API_BASE_URL}/api/devices`;
      console.log('[InternetConnectivity] Checking connectivity to:', url);

      // Try to reach the API server with a longer timeout for mobile networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[InternetConnectivity] Request timeout, aborting...');
        controller.abort();
      }, 8000); // 8 second timeout for mobile networks

      // Try GET request (more reliable than HEAD on some networks)
      let response;
      try {
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          },
        });
      } catch (fetchError: any) {
        // If fetch fails completely, it might be a network issue
        if (fetchError.name === 'AbortError') {
          console.log('[InternetConnectivity] Request was aborted (timeout)');
        } else {
          console.log('[InternetConnectivity] Fetch error:', fetchError.message);
        }
        throw fetchError;
      }

      clearTimeout(timeoutId);

      const isConnected = response.ok || response.status < 500; // Accept any non-server-error as connected

      console.log('[InternetConnectivity] Connectivity check result:', {
        isConnected,
        status: response.status,
        statusText: response.statusText,
      });

      if (isMountedRef.current) {
        setConnectivity({
          isConnected,
          isChecking: false,
          lastCheck: new Date(),
        });
      }

      return isConnected;
    } catch (error: any) {
      // Network error or timeout means no internet
      console.warn('[InternetConnectivity] Connectivity check failed:', {
        error: error.message,
        url: API_BASE_URL,
      });
      
      if (isMountedRef.current) {
        setConnectivity({
          isConnected: false,
          isChecking: false,
          lastCheck: new Date(),
        });
      }
      return false;
    }
  };

  // Initial check
  useEffect(() => {
    isMountedRef.current = true;
    checkConnectivity();

    // Set up periodic checks
    if (checkInterval > 0) {
      intervalRef.current = setInterval(() => {
        checkConnectivity();
      }, checkInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkInterval]);

  return {
    isConnected: connectivity.isConnected,
    isChecking: connectivity.isChecking,
    lastCheck: connectivity.lastCheck,
    checkConnectivity,
  };
};
