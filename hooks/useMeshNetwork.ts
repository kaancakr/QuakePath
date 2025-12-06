import { useEffect, useState, useCallback, useRef } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { BleManager, Device, Characteristic, Service, State } from "react-native-ble-plx";
import base64 from "react-native-base64";

// BLE Service and Characteristic UUIDs for mesh networking
const MESH_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const MESH_CHARACTERISTIC_WRITE_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const MESH_CHARACTERISTIC_READ_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
const MESH_ADVERTISING_NAME = "QuakePathMesh";

interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  lastSeen: Date;
  status: "online" | "offline" | "connecting";
  device?: Device;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export type MessageType = "emergency" | "chat" | "location" | "status" | "broadcast";

export interface MeshMessage {
  id: string;
  sender: string;
  recipient?: string; // If undefined, message is broadcast to all
  type: MessageType;
  content: string;
  data?: any;
  timestamp: string;
  deviceInfo?: {
    platform: string;
    version: string | number;
  };
}

interface EmergencyAlert {
  sender: string;
  data: {
    message: string;
    location: LocationData | string;
    timestamp: string;
    type: "emergency";
    deviceInfo?: {
      platform: string;
      version: string | number;
    };
  };
}

export const useMeshNetwork = () => {
  const managerRef = useRef<BleManager | null>(null);
  const [manager] = useState(() => {
    if (!managerRef.current) {
      managerRef.current = new BleManager();
    }
    return managerRef.current;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [alertHandlers, setAlertHandlers] = useState<
    ((alert: EmergencyAlert) => void)[]
  >([]);
  const [messageHistory, setMessageHistory] = useState<MeshMessage[]>([]);
  const [messageHandlers, setMessageHandlers] = useState<
    ((message: MeshMessage) => void)[]
  >([]);
  
  const deviceIdRef = useRef<string>(`${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const connectedDevicesMap = useRef<Map<string, Device>>(new Map());
  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const scanSubscriptionRef = useRef<any>(null);
  const isInitializedRef = useRef<boolean>(false);
  const processingDevicesRef = useRef<Set<string>>(new Set());
  const MAX_CONNECTED_DEVICES = 10;

  // Request Bluetooth permissions
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          throw new Error("Bluetooth permissions not granted");
        }
      } catch (error) {
        console.error("Permission request error:", error);
        throw error;
      }
    }
  }, []);

  // Initialize Bluetooth
  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    const initializeBluetooth = async () => {
      if (!manager || isInitializedRef.current) {
        return;
      }

      try {
        isInitializedRef.current = true;
        
        // Request permissions first
        try {
          await requestPermissions();
        } catch (permError) {
          console.error("Permission error:", permError);
          // Continue anyway, permissions might already be granted
        }
        
        // Wait a bit for permissions to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if manager is still valid
        if (!manager) {
          console.error("Manager is null");
          isInitializedRef.current = false;
          return;
        }
        
        // Check if Bluetooth is enabled
        let state: State;
        try {
          state = await manager.state();
          console.log("Bluetooth state:", state);
        } catch (error: any) {
          if (error.message && error.message.includes("destroyed")) {
            console.error("Manager was destroyed, cannot initialize");
            isInitializedRef.current = false;
            return;
          }
          console.error("Error checking Bluetooth state:", error.message || error);
          isInitializedRef.current = false;
          return;
        }
        
        if (state !== "PoweredOn") {
          console.warn("Bluetooth is not powered on. Current state:", state);
          setIsConnected(false);
          // Listen for state changes
          const subscription = manager.onStateChange((newState: State) => {
            console.log("Bluetooth state changed:", newState);
            if (newState === "PoweredOn") {
              console.log("Bluetooth powered on, starting mesh network");
              startMeshNetwork();
            } else {
              setIsConnected(false);
            }
          });
          return () => {
            try {
              subscription.remove();
            } catch (e) {
              // Ignore
            }
          };
        }
        
        await startMeshNetwork();
      } catch (error: any) {
        console.error("Failed to initialize Bluetooth:", error.message || error);
        setIsConnected(false);
        isInitializedRef.current = false;
      }
    };

    initializeBluetooth();

    return () => {
      // Don't destroy manager on cleanup - let it persist
      // Only cleanup active operations
      stopScanning();
      stopAdvertising();
      disconnectAllDevices();
    };
  }, [manager]);

  // Start mesh network (scanning and advertising)
  const startMeshNetwork = useCallback(async () => {
    try {
      await startScanning();
      await startAdvertising();
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to start mesh network:", error);
    }
  }, []);

  // Start scanning for nearby devices
  const startScanning = useCallback(async () => {
    if (isScanning) {
      console.log("Scan already in progress, skipping...");
      return;
    }

    if (!manager) {
      console.error("Manager is null, cannot start scanning");
      return;
    }

    try {
      // Check Bluetooth state first
      let state: State;
      try {
        state = await manager.state();
      } catch (error: any) {
        if (error.message && error.message.includes("destroyed")) {
          console.error("Manager was destroyed");
          return;
        }
        throw error;
      }
      if (state !== "PoweredOn") {
        console.warn("Bluetooth not powered on, state:", state);
        setIsScanning(false);
        return;
      }

      // Stop any existing scan first
      if (scanSubscriptionRef.current) {
        try {
          manager.stopDeviceScan();
        } catch (e) {
          // Ignore errors when stopping
        }
        scanSubscriptionRef.current = null;
      }

      // Wait a bit before starting new scan
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsScanning(true);
      console.log("Starting BLE scan...");

      const subscription = manager.startDeviceScan(
        null, // Scan for all devices
        { allowDuplicates: false },
        (error: any, device: Device | null) => {
          if (error) {
            // Only log non-critical errors
            if (error.message && !error.message.includes("Scanning already started")) {
              console.error("Scan error:", error.message || error);
            }
            return;
          }

          if (device) {
            const deviceName = device.name || "";
            const deviceId = device.id || "";
            
            // Skip invalid device IDs
            if (!deviceId || deviceId.length === 0 || deviceId.includes("unknown")) {
              return;
            }
            
            // Skip if already connected
            if (connectedDevicesMap.current.has(deviceId)) {
              return;
            }
            
            // Skip if we've reached the limit
            if (connectedDevicesMap.current.size >= MAX_CONNECTED_DEVICES) {
              return;
            }
            
            // Skip if currently processing
            if (processingDevicesRef.current.has(deviceId)) {
              return;
            }
            
            // Only connect to devices that are connectable
            if (!device.isConnectable) {
              return;
            }
            
            // Filter out obviously non-mesh devices (headphones, watches, etc.)
            // But be less restrictive since we can't advertise
            const lowerName = deviceName.toLowerCase();
            const skipDevices = [
              'headphone', 'earbud', 'earphone', 'watch', 'fitbit', 'jabra', 
              'jbl', 'lg hbs', 'huawei watch', 'samsung galaxy watch', 'apple watch', 
              'airpods', 'beats', 'sony wh', 'bose', 'skullcandy', 'tune520', 
              'elite 3', 'pro-d94', 'hbs-fn6'
            ];
            
            // Only skip if name clearly matches a known device type
            if (deviceName && skipDevices.some(skip => lowerName.includes(skip))) {
              return;
            }
            
            // Try connecting to devices that might be QuakePath
            // We'll verify after connection by checking services
            // Connect to devices that:
            // 1. Are connectable
            // 2. Don't have obvious non-app names
            // 3. Have a MAC address format (Android BLE devices)
            
            const isMacAddress = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(deviceId);
            
            if (isMacAddress || (!deviceName && isMacAddress)) {
              // Android BLE device - could be QuakePath
              console.log("Found potential QuakePath device:", deviceName || deviceId);
              handleDeviceDiscovered(device);
            } else if (deviceName && deviceName.length > 0 && deviceName.length < 30) {
              // Device with a name that's not obviously a consumer device
              console.log("Found device with name:", deviceName, deviceId);
              handleDeviceDiscovered(device);
            }
          }
        }
      );

      scanSubscriptionRef.current = subscription;

      // Stop scanning after 30 seconds and restart
      setTimeout(() => {
        if (scanSubscriptionRef.current) {
          try {
            manager.stopDeviceScan();
          } catch (e) {
            console.error("Error stopping scan:", e);
          }
          scanSubscriptionRef.current = null;
          setIsScanning(false);
          // Restart scanning after a short delay
          setTimeout(() => {
            if (isConnected) {
              startScanning();
            }
          }, 3000);
        }
      }, 30000);
    } catch (error: any) {
      console.error("Failed to start scanning:", error.message || error);
      setIsScanning(false);
      // Retry after delay
      setTimeout(() => {
        if (isConnected) {
          startScanning();
        }
      }, 5000);
    }
  }, [isScanning, manager, isConnected]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (scanSubscriptionRef.current) {
      manager.stopDeviceScan();
      scanSubscriptionRef.current = null;
      setIsScanning(false);
    }
  }, [manager]);

  // Start advertising (peripheral mode)
  const startAdvertising = useCallback(async () => {
    if (isAdvertising) return;

    try {
      setIsAdvertising(true);
      console.log("Starting BLE advertising...");
      
      // Note: react-native-ble-plx doesn't support peripheral mode directly
      // This would require native code or a different library
      // For now, we'll use central mode only (scanning and connecting)
      // In a production app, you'd need to implement peripheral mode separately
      
      console.log("Advertising started (simulated - requires native implementation)");
    } catch (error) {
      console.error("Failed to start advertising:", error);
      setIsAdvertising(false);
    }
  }, [isAdvertising]);

  // Stop advertising
  const stopAdvertising = useCallback(() => {
    setIsAdvertising(false);
  }, []);

  // Handle discovered device
  const handleDeviceDiscovered = useCallback(async (device: Device) => {
    const deviceId = device.id;
    
    // Limit to MAX_CONNECTED_DEVICES
    if (connectedDevicesMap.current.size >= MAX_CONNECTED_DEVICES) {
      console.log(`Maximum device limit reached (${MAX_CONNECTED_DEVICES}), skipping:`, deviceId);
      return;
    }
    
    // Skip if already connected
    if (connectedDevicesMap.current.has(deviceId)) {
      return;
    }
    
    // Skip if currently processing this device (prevent loops)
    if (processingDevicesRef.current.has(deviceId)) {
      return;
    }

    // Check if device is already in our list with online/connecting status
    const existingDevice = connectedDevices.find((d) => d.id === deviceId);
    if (existingDevice && (existingDevice.status === "online" || existingDevice.status === "connecting")) {
      return;
    }
    
    // Mark as processing
    processingDevicesRef.current.add(deviceId);

    try {
      // Add to list as connecting
      const deviceInfo: DeviceInfo = {
        id: deviceId,
        name: device.name || `Device ${deviceId.substring(0, 8)}`,
        type: Platform.OS,
        lastSeen: new Date(),
        status: "connecting",
        device,
      };

      setConnectedDevices((prev) => {
        const filtered = prev.filter((d) => d.id !== deviceId);
        return [...filtered, deviceInfo];
      });

      // Connect to device (with timeout)
      const connectPromise = device.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      );
      
      const connectedDevice = await Promise.race([connectPromise, timeoutPromise]) as Device;
      console.log("Connected to device:", deviceId);

      // Discover services
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Find mesh service
      const services = await connectedDevice.services();
      console.log("Discovered services on device:", services.map(s => s.uuid));
      
      const meshService = services.find((s: Service) => s.uuid === MESH_SERVICE_UUID);

      if (!meshService) {
        console.warn("Mesh service not found on device:", deviceId, "- This is not a QuakePath device");
        console.warn("Available services:", services.map(s => s.uuid).join(", "));
        
        // Disconnect from non-QuakePath devices
        try {
          await connectedDevice.cancelConnection();
        } catch (e) {
          // Ignore
        }
        
        // Remove from list
        setConnectedDevices((prev) =>
          prev.filter((d) => d.id !== deviceId)
        );
        
        // Remove from processing
        processingDevicesRef.current.delete(deviceId);
        return;
      }
      
      console.log("✅ QuakePath device confirmed! Mesh service found on:", deviceId);

      // Find read characteristic and subscribe
      const characteristics = await meshService.characteristics();
      const readCharacteristic = characteristics.find(
        (c: Characteristic) => c.uuid === MESH_CHARACTERISTIC_READ_UUID
      );

      if (readCharacteristic) {
        // Monitor for incoming messages
        const subscription = readCharacteristic.monitor((error: any, characteristic: Characteristic | null) => {
          if (error) {
            console.error("Characteristic monitor error:", error);
            return;
          }

          if (characteristic?.value) {
            try {
              // Decode base64 to string
              const decodedString = base64.decode(characteristic.value);
              const messageData = JSON.parse(decodedString);
              handleIncomingMessage(messageData);
            } catch (parseError) {
              console.error("Failed to parse message:", parseError);
            }
          }
        });

        subscriptionsRef.current.set(deviceId, subscription);
      }

      // Update device status
      connectedDevicesMap.current.set(deviceId, connectedDevice);
      setConnectedDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId ? { ...d, status: "online", lastSeen: new Date() } : d
        )
      );

      // Send device info to newly connected device
      await sendDeviceInfo(connectedDevice);
      
      // Remove from processing set
      processingDevicesRef.current.delete(deviceId);
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      
      // Don't log "already connected" errors repeatedly
      if (!errorMsg.includes("already connected") && !errorMsg.includes("Operation was cancelled")) {
        console.error("Failed to connect to device:", errorMsg);
      }
      
      // Remove from list if connection failed
      setConnectedDevices((prev) =>
        prev.filter((d) => d.id !== deviceId)
      );
      
      // Remove from processing set on error
      processingDevicesRef.current.delete(deviceId);
      
      // Remove from connected devices map if it was added
      if (connectedDevicesMap.current.has(deviceId)) {
        try {
          const device = connectedDevicesMap.current.get(deviceId);
          if (device) {
            await device.cancelConnection();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        connectedDevicesMap.current.delete(deviceId);
      }
      
      // If device is already connected, mark it as such instead of erroring
      if (errorMsg.includes("already connected")) {
        // Device might already be connected, check if we have it
        try {
          const existingDevice = await manager.devices([deviceId]);
          if (existingDevice && existingDevice.length > 0) {
            const device = existingDevice[0];
            const isConnected = await device.isConnected();
            if (isConnected) {
              // Device is connected, add it to our map
              connectedDevicesMap.current.set(deviceId, device);
              setConnectedDevices((prev) => {
                const filtered = prev.filter((d) => d.id !== deviceId);
                return [...filtered, {
                  id: deviceId,
                  name: device.name || `Device ${deviceId.substring(0, 8)}`,
                  type: Platform.OS,
                  lastSeen: new Date(),
                  status: "online" as const,
                  device,
                }];
              });
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [connectedDevices, manager]);

  // Send device info to connected device
  const sendDeviceInfo = useCallback(async (device: Device) => {
    try {
      const deviceInfo: MeshMessage = {
        id: `${deviceIdRef.current}-${Date.now()}`,
        sender: deviceIdRef.current,
        type: "status",
        content: "device_connected",
        data: {
          deviceId: deviceIdRef.current,
          platform: Platform.OS,
          version: Platform.Version,
        },
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      await sendMessageToDevice(device, deviceInfo);
    } catch (error) {
      console.error("Failed to send device info:", error);
    }
  }, []);

  // Send message to a specific device
  const sendMessageToDevice = useCallback(
    async (device: Device, message: MeshMessage) => {
      try {
        const services = await device.services();
        const meshService = services.find((s: Service) => s.uuid === MESH_SERVICE_UUID);
        if (!meshService) {
          throw new Error("Mesh service not found");
        }

        const characteristics = await meshService.characteristics();
        const writeCharacteristic = characteristics.find(
          (c: Characteristic) => c.uuid === MESH_CHARACTERISTIC_WRITE_UUID
        );

        if (!writeCharacteristic) {
          throw new Error("Write characteristic not found");
        }

        const messageJson = JSON.stringify(message);
        // Encode string to base64
        const messageBase64 = base64.encode(messageJson);

        await writeCharacteristic.writeWithResponse(messageBase64);
        console.log("Message sent to device:", device.id);
      } catch (error) {
        console.error("Failed to send message to device:", error);
        throw error;
      }
    },
    []
  );

  // Handle incoming message
  const handleIncomingMessage = useCallback((messageData: any) => {
    console.log("Received mesh message:", messageData);

    // Handle legacy emergency alert format
    if (messageData.data && messageData.data.type === "emergency") {
      const alert: EmergencyAlert = {
        sender: messageData.sender || messageData.data.sender,
        data: messageData.data,
      };
      alertHandlers.forEach((handler) => handler(alert));
    }

    // Handle new mesh message format
    if (messageData.type && messageData.content) {
      const message = messageData as MeshMessage;
      // Only add to history if it's not from this device
      if (message.sender !== deviceIdRef.current) {
        setMessageHistory((prev) => [...prev, message]);
      }
      messageHandlers.forEach((handler) => handler(message));
    }
  }, [alertHandlers, messageHandlers]);

  // Disconnect all devices
  const disconnectAllDevices = useCallback(async () => {
    for (const [deviceId, device] of connectedDevicesMap.current.entries()) {
      try {
        const subscription = subscriptionsRef.current.get(deviceId);
        if (subscription) {
          subscription.remove();
        }
        await device.cancelConnection();
      } catch (error) {
        console.error(`Failed to disconnect device ${deviceId}:`, error);
      }
    }
    connectedDevicesMap.current.clear();
    subscriptionsRef.current.clear();
    processingDevicesRef.current.clear();
    setConnectedDevices([]);
  }, []);

  // Send emergency alert
  const sendEmergencyAlert = useCallback(
    async (alertData: EmergencyAlert["data"]) => {
      if (!isConnected || connectedDevicesMap.current.size === 0) {
        throw new Error("Not connected to mesh network");
      }

      console.log("Sending emergency alert:", alertData);

      const message: MeshMessage = {
        id: `${deviceIdRef.current}-${Date.now()}`,
        sender: deviceIdRef.current,
        type: "emergency",
        content: alertData.message || "Emergency alert",
        data: alertData,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      // Broadcast to all connected devices
      const sendPromises = Array.from(connectedDevicesMap.current.values()).map(
        (device) => sendMessageToDevice(device, message).catch((error) => {
          console.error(`Failed to send to device ${device.id}:`, error);
        })
      );

      await Promise.all(sendPromises);
      setMessageHistory((prev) => [...prev, message]);
    },
    [isConnected, sendMessageToDevice]
  );

  // Register emergency alert handler
  const onEmergencyAlert = useCallback(
    (handler: (alert: EmergencyAlert) => void) => {
      setAlertHandlers((prev) => [...prev, handler]);
      return () => {
        setAlertHandlers((prev) => prev.filter((h) => h !== handler));
      };
    },
    []
  );

  // Send general mesh message
  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = "chat",
      recipient?: string,
      data?: any
    ) => {
      if (!isConnected) {
        throw new Error("Not connected to mesh network");
      }

      const message: MeshMessage = {
        id: `${deviceIdRef.current}-${Date.now()}`,
        sender: deviceIdRef.current,
        recipient,
        type,
        content,
        data,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      console.log("Sending mesh message:", message);

      if (recipient) {
        // Send to specific device
        const device = connectedDevicesMap.current.get(recipient);
        if (!device) {
          throw new Error("Recipient device not found");
        }
        await sendMessageToDevice(device, message);
      } else {
        // Broadcast to all devices
        const sendPromises = Array.from(connectedDevicesMap.current.values()).map(
          (device) => sendMessageToDevice(device, message).catch((error) => {
            console.error(`Failed to send to device ${device.id}:`, error);
          })
        );
        await Promise.all(sendPromises);
      }

      setMessageHistory((prev) => [...prev, message]);
    },
    [isConnected, sendMessageToDevice]
  );

  // Register message handler
  const onMessage = useCallback(
    (handler: (message: MeshMessage) => void) => {
      setMessageHandlers((prev) => [...prev, handler]);
      return () => {
        setMessageHandlers((prev) => prev.filter((h) => h !== handler));
      };
    },
    []
  );

  // Clear message history
  const clearMessageHistory = useCallback(() => {
    setMessageHistory([]);
  }, []);

  return {
    isConnected,
    isScanning,
    isAdvertising,
    connectedDevices,
    sendEmergencyAlert,
    onEmergencyAlert,
    sendMessage,
    onMessage,
    messageHistory,
    clearMessageHistory,
    deviceId: deviceIdRef.current,
    startScanning,
    stopScanning,
  };
};
