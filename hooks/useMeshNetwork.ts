import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const SERVER_URL = Platform.select({
  web: 'http://192.168.68.117:3000',
  default: 'http://192.168.68.117:3000'
});

interface Device {
  id: string;
  type: string;
  lastSeen: Date;
  status: 'online' | 'offline';
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

interface EmergencyAlert {
  sender: string;
  data: {
    message: string;
    location: LocationData | string;
    timestamp: string;
    type: 'emergency';
    deviceInfo?: {
      platform: string;
      version: string | number;
    };
  };
}

export const useMeshNetwork = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [alertHandlers, setAlertHandlers] = useState<((alert: EmergencyAlert) => void)[]>([]);

  // Initialize socket connection
  useEffect(() => {
    console.log('Connecting to server:', SERVER_URL);
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
      setIsConnected(true);
      // Register device
      newSocket.emit('register', {
        type: Platform.OS,
        userAgent: Platform.Version,
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('devicesUpdate', (devices: Device[]) => {
      console.log('Devices update received:', devices);
      if (Array.isArray(devices)) {
        setConnectedDevices(devices);
      } else {
        console.warn('Received invalid devices data:', devices);
        setConnectedDevices([]);
      }
    });

    newSocket.on('meshMessage', (data: EmergencyAlert) => {
      console.log('Received mesh message:', data);
      alertHandlers.forEach(handler => handler(data));
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  // Send heartbeat every 30 seconds
  useEffect(() => {
    if (!socket) return;

    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat');
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [socket]);

  // Send emergency alert
  const sendEmergencyAlert = useCallback(async (alertData: EmergencyAlert['data']) => {
    if (!socket || !isConnected) {
      console.error('Cannot send alert: Socket not connected');
      throw new Error('Not connected to mesh network');
    }

    console.log('Sending emergency alert:', alertData);

    return new Promise<void>((resolve, reject) => {
      const message = {
        type: 'emergency',
        content: {
          ...alertData,
          sender: socket.id,
          timestamp: new Date().toISOString(),
        }
      };

      socket.emit('meshMessage', message, (error?: Error) => {
        if (error) {
          console.error('Failed to send emergency alert:', error);
          reject(error);
        } else {
          console.log('Emergency alert sent successfully:', message);
          resolve();
        }
      });
    });
  }, [socket, isConnected]);

  // Register emergency alert handler
  const onEmergencyAlert = useCallback((handler: (alert: EmergencyAlert) => void) => {
    setAlertHandlers(prev => [...prev, handler]);
    return () => {
      setAlertHandlers(prev => prev.filter(h => h !== handler));
    };
  }, []);

  return {
    isConnected,
    connectedDevices,
    sendEmergencyAlert,
    onEmergencyAlert,
  };
}; 