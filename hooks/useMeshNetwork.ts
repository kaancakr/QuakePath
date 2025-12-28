import { useEffect, useState, useCallback, useRef } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import {
  BleManager,
  Device,
  Characteristic,
  Service,
  State,
  ScanMode,
} from "react-native-ble-plx";
import base64 from "react-native-base64";
import {
  startMeshAdvertising,
  stopMeshAdvertising,
} from "@/utils/meshAdvertiser";
import { NativeModules, NativeEventEmitter } from "react-native";

/* =======================
   CONSTANTS
======================= */

const MESH_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const MESH_CHAR_WRITE = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const MESH_SERVICE_UUID_NORMALIZED = MESH_SERVICE_UUID.toLowerCase();
const MESH_CHAR_WRITE_NORMALIZED = MESH_CHAR_WRITE.toLowerCase();
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 2000;

const MAX_CONNECTED_DEVICES = 10;
const DEVICE_RETENTION_MS = 60_000;
const MAX_SEEN_IDS = 1000;
const DEFAULT_TTL = 5;

/* =======================
   TYPES
======================= */

export type MessageType =
  | "emergency"
  | "chat"
  | "location"
  | "status"
  | "broadcast";

export interface MeshMessage {
  id: string;
  sender: string;
  recipient?: string;
  type: MessageType;
  content: string;
  data?: any;
  ttl: number;
  timestamp: string;
  deviceInfo?: {
    platform: string;
    version: string | number;
  };
}

interface DeviceInfo {
  id: string;
  name: string;
  status: "connecting" | "online" | "offline";
  lastSeen: Date;
  device?: Device;
}

interface ScannedDevice {
  id: string;
  name?: string | null;
  isConnectable?: boolean | null;
  rssi?: number | null;
  lastSeen: Date;
}

interface EmergencyAlert {
  sender: string;
  data: any;
}

/* =======================
   HOOK
======================= */

export const useMeshNetwork = () => {
  const managerRef = useRef(new BleManager());
  const deviceIdRef = useRef(
    `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const connectedMap = useRef<Map<string, Device>>(new Map());
  const processingRef = useRef<Set<string>>(new Set());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const seenScanRef = useRef<Set<string>>(new Set());
  const disconnectSubsRef = useRef<Map<string, () => void>>(new Map());
  const retryCountsRef = useRef<Map<string, number>>(new Map());
  const scannedDeviceMapRef = useRef<Map<string, Device>>(new Map());
  // Map deviceId (from message sender) to BLE device ID
  const deviceIdToBleIdMap = useRef<Map<string, string>>(new Map());
  // Map BLE device ID to deviceId
  const bleIdToDeviceIdMap = useRef<Map<string, string>>(new Map());

  const meshEmitterRef = useRef<NativeEventEmitter | null>(null);

  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastScanEvent, setLastScanEvent] = useState<string | null>(null);
  const [messageHistory, setMessageHistory] = useState<MeshMessage[]>([]);

  const alertHandlers = useRef<((a: EmergencyAlert) => void)[]>([]);
  const messageHandlers = useRef<((m: MeshMessage) => void)[]>([]);

  /* =======================
     PERMISSIONS
  ======================= */

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return true;
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const denied = Object.entries(result)
      .filter(([, value]) => value !== PermissionsAndroid.RESULTS.GRANTED)
      .map(([key]) => key);

    if (denied.length) {
      console.warn("[useMeshNetwork] permissions denied:", denied);
      return false;
    }
    return true;
  };

  /* =======================
     INIT
  ======================= */

  useEffect(() => {
    const init = async () => {
      const ok = await requestPermissions();
      if (!ok) {
        console.warn("[useMeshNetwork] required permissions not granted, aborting start");
        return;
      }
      const state = await managerRef.current.state();
      if (state === State.PoweredOn) {
        startMesh();
      }
    };
    init();

    return () => {
      stopScanning();
      stopAdvertising();
      disconnectAll();
    };
  }, []);

  // Keep listening for BLE state changes so we actually start once Bluetooth is on.
  useEffect(() => {
    const subscription = managerRef.current.onStateChange(
      (state) => {
        console.log("[useMeshNetwork] BLE state change:", state);
        if (state === State.PoweredOn) {
          startMesh();
        } else {
          stopScanning();
          stopAdvertising();
          setIsConnected(false);
        }
      },
      true // fire immediately with current state
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /* =======================
     MESH START / STOP
  ======================= */

  const startMesh = async () => {
    await restartScanning();
    await startAdvertising();
  };

  const updateConnectionState = () => {
    // Only consider connected if we have actual BLE connections (connectedMap)
    // This ensures we can actually send messages, not just receive them
    const hasConnections = connectedMap.current.size > 0;
    setIsConnected(hasConnections);
    console.log(`[useMeshNetwork] updateConnectionState: connectedMap.size=${connectedMap.current.size}, isConnected=${hasConnections}`);
  };

  const handleDisconnected = async (device: Device, error?: any) => {
    const id = device?.id;
    console.log("[useMeshNetwork] disconnected", id, error?.message);
    setLastScanEvent(`disconnected:${id ?? "unknown"}`);

    if (id) {
      disconnectSubsRef.current.get(id)?.();
      disconnectSubsRef.current.delete(id);
      connectedMap.current.delete(id);
      setConnectedDevices((p) => p.filter((d) => d.id !== id));
      updateConnectionState();

      const retries = (retryCountsRef.current.get(id) || 0) + 1;
      if (retries <= MAX_RECONNECT_ATTEMPTS) {
        retryCountsRef.current.set(id, retries);
        const delay = RECONNECT_BASE_DELAY_MS * retries;
        console.log(
          "[useMeshNetwork] retrying connect",
          id,
          "attempt",
          retries,
          "in",
          delay,
          "ms"
        );
        setTimeout(() => {
          connectToDevice(id).catch((e) =>
            console.warn("[useMeshNetwork] reconnect failed", id, e)
          );
        }, delay);
      } else {
        retryCountsRef.current.delete(id);
      }
    }
  };

  /* =======================
     SCANNING (OUTBOUND ONLY)
  ======================= */

  const restartScanning = async () => {
    stopScanning();
    return startScanning();
  };

  const startScanning = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanError(null);
    setLastScanEvent("start");
    console.log("[useMeshNetwork] startDeviceScan() - Filtering for Quakepath Service");
  
    // 1. HARDWARE FILTER: Only wake up JS for devices advertising this UUID
    managerRef.current.startDeviceScan(
      [MESH_SERVICE_UUID], // Filter at the OS level
      { 
        allowDuplicates: true, 
        scanMode: ScanMode.LowLatency 
      },
      (err, device) => {
        if (err) {
          console.warn("[useMeshNetwork] scan error", err);
          setScanError(err.message);
          setIsScanning(false);
          setLastScanEvent(`error:${err.message}`);
          return;
        }
  
        if (!device?.id) return;
        setLastScanEvent("device_found");
  
        // 2. SOFTWARE FILTER: Verify serviceUUIDs presence
        // Some Android devices report the device first without the full scan record.
        // We check if the MESH_SERVICE_UUID is in the device's advertised services.
        const isQuakepathDevice = device.serviceUUIDs?.some(
          (uuid) => uuid.toUpperCase() === MESH_SERVICE_UUID.toUpperCase()
        );
  
        // UI Update: We only add to scanned list if it matches our criteria
        if (isQuakepathDevice) {
          // Store device reference for later lookup
          scannedDeviceMapRef.current.set(device.id, device);
          console.log(`[useMeshNetwork] Found Quakepath device: ${device.id}, name: ${device.name || 'Unknown'}, RSSI: ${device.rssi}`);
          
          setScannedDevices((prev) => {
            const idx = prev.findIndex((d) => d.id === device.id);
            const nextEntry: ScannedDevice = {
              id: device.id,
              name: device.name || "Quakepath Device", // Default name if null
              isConnectable: device.isConnectable,
              rssi: device.rssi,
              lastSeen: new Date(),
            };
            if (idx === -1) {
              console.log(`[useMeshNetwork] Adding new scanned device to UI: ${device.id}`);
              return [...prev, nextEntry];
            }
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...nextEntry };
            return copy;
          });
  
          // 3. AUTO-CONNECT: Only connect if it's our device and not already busy
          if (!connectedMap.current.has(device.id) && !processingRef.current.has(device.id)) {
            console.log("[useMeshNetwork] Valid Quakepath device found, auto-connecting:", device.id);
            connectToDevice(device);
          } else {
            console.log(`[useMeshNetwork] Device ${device.id} already connected or processing`);
          }
        } else {
          // Log discarded non-matching devices for debugging
          console.log("[useMeshNetwork] Discarding non-mesh device:", device.id, "serviceUUIDs:", device.serviceUUIDs);
        }
      }
    );
  };

  const stopScanning = () => {
    managerRef.current.stopDeviceScan();
    setIsScanning(false);
    setLastScanEvent("stopped");
    console.log("[useMeshNetwork] stopDeviceScan()");
  };

  /* =======================
     ADVERTISING (NATIVE)
  ======================= */

  const startAdvertising = async () => {
    if (Platform.OS === "android") {
      const ok = await startMeshAdvertising(MESH_SERVICE_UUID);
      if (ok) {
        setIsAdvertising(true);
        setLastScanEvent((prev) => prev ?? "advertising");
      }
    }
  };

  const stopAdvertising = async () => {
    if (Platform.OS === "android") {
      await stopMeshAdvertising();
      setIsAdvertising(false);
    }
  };

  /* =======================
     CONNECT DEVICE
  ======================= */

  const connectToDevice = async (deviceOrId: Device | string) => {
    const id = typeof deviceOrId === "string" ? deviceOrId : deviceOrId.id;
    if (!id) return;
    if (connectedMap.current.has(id)) return;
    if (processingRef.current.has(id)) return;
    
    processingRef.current.add(id);
  
    try {
      setLastScanEvent(`connecting:${id}`);
      console.log(`[useMeshNetwork] Attempting connection to: ${id}`);
  
      // 1. Establish the physical connection
      // We use the manager directly for better stability on Android
      const d = await managerRef.current.connectToDevice(id, { timeout: 10000 });
  
      if (Platform.OS === 'android') {
        await d.requestMTU(512); // Request larger packets for JSON
      }
      // 2. Discover services and characteristics (Requirement for GATT)
      await d.discoverAllServicesAndCharacteristics();
  
      // 3. Validation: Verify this is a Quakepath-compatible device
      const services = await d.services();
      const meshService = services.find(
        (s) => s.uuid?.toLowerCase() === MESH_SERVICE_UUID_NORMALIZED
      );
  
      if (!meshService) {
        console.warn(`[useMeshNetwork] Device ${id} does not have Mesh Service. Disconnecting...`);
        // Crucial: Disconnect immediately to free up the BLE radio
        await d.cancelConnection();
        return;
      }
  
      // 4. Successful validation - Update State
      connectedMap.current.set(id, d);
      console.log(`[useMeshNetwork] Device ${id} added to connectedMap, total: ${connectedMap.current.size}`);
      
      // Store device mapping - we'll update this when we receive a status message
      const deviceInfo: DeviceInfo = {
        id,
        name: d.name || "Quakepath Device",
        status: "online",
        lastSeen: new Date(),
        device: d,
      };
      
      setConnectedDevices((p) => {
        const existing = p.find((dev) => dev.id === id);
        if (existing) {
          // Update existing entry
          return p.map((dev) => (dev.id === id ? { ...deviceInfo, id: dev.id } : dev));
        }
        return [...p, deviceInfo];
      });
  
      // 5. Setup Disconnection Listener
      disconnectSubsRef.current.get(id)?.(); // Clear existing if any
      const sub = d.onDisconnected((err, dev) => {
        handleDisconnected(dev || d, err);
      });
      disconnectSubsRef.current.set(id, () => sub.remove());
      
      // Reset retry logic on successful connection
      retryCountsRef.current.delete(id);
      updateConnectionState();
      setLastScanEvent(`connected:${id}`);
      
      // 6. Handshake: Send status message to trigger bidirectional logic
      try {
        const statusMsg: MeshMessage = {
          id: `${deviceIdRef.current}-status-${Date.now()}`,
          sender: deviceIdRef.current,
          type: "status",
          content: "connected",
          ttl: DEFAULT_TTL,
          timestamp: new Date().toISOString(),
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        };
        await sendMessageToDevice(d, statusMsg);
        console.log(`[useMeshNetwork] Handshake sent to ${id}`);
        
        // Store mapping: BLE device ID -> deviceId (we'll learn their deviceId from their response)
        // The mapping will be updated when we receive their status message in handleIncomingMessage
      } catch (e) {
        console.warn("[useMeshNetwork] Initial status message failed", id, e);
      }
  
    } catch (error: any) {
      console.error(`[useMeshNetwork] Connection failed for ${id}:`, error.message);
      setLastScanEvent(`failed:${id}`);
      // If connection failed mid-way, ensure we trigger the disconnect handler logic
      if (id) handleDisconnected({ id } as Device, error);
    } finally {
      processingRef.current.delete(id);
    }
  };

  const connectScannedDevice = async (id: string) => {
    setLastScanEvent(`manual_connect:${id}`);
    await connectToDevice(id);
  };

  /* =======================
     SEND MESSAGE (OUTBOUND)
  ======================= */

  const sendMessageToDevice = async (device: Device, msg: MeshMessage) => {
    try {
      const services = await device.services();
      const mesh = services.find(
        (s) => s.uuid?.toLowerCase() === MESH_SERVICE_UUID_NORMALIZED
      );
      if (!mesh) {
        console.log("[useMeshNetwork] skip device without mesh service", device.id);
        return;
      }

      const chars = await mesh.characteristics();
      const writeChar = chars.find(
        (c) => c.uuid?.toLowerCase() === MESH_CHAR_WRITE_NORMALIZED
      );
      if (!writeChar) {
        console.warn("[useMeshNetwork] write characteristic not found for", device.id);
        return;
      }

      const jsonStr = JSON.stringify(msg);
      const base64Str = base64.encode(jsonStr);
      console.log("[useMeshNetwork] sending message to", device.id, "content:", msg.content);
      await writeChar.writeWithResponse(base64Str);
      console.log("[useMeshNetwork] message sent successfully to", device.id);
    } catch (e) {
      console.error("[useMeshNetwork] failed to send message to", device.id, e);
    }
  };

  const sendMessage = async (
    content: string,
    type: MessageType = "chat",
    data?: any
  ) => {
    const msg: MeshMessage = {
      id: `${deviceIdRef.current}-${Date.now()}`,
      sender: deviceIdRef.current,
      type,
      content,
      data,
      ttl: DEFAULT_TTL,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
      },
    };

    console.log(`[useMeshNetwork] sendMessage called, connectedMap size: ${connectedMap.current.size}`);
    console.log(`[useMeshNetwork] connectedMap keys:`, Array.from(connectedMap.current.keys()));
    console.log(`[useMeshNetwork] deviceIdToBleIdMap:`, Array.from(deviceIdToBleIdMap.current.entries()));

    // Send to all connected BLE devices
    const sendPromises: Promise<void>[] = [];
    const devicesToSend = Array.from(connectedMap.current.values());
    
    if (devicesToSend.length === 0) {
      console.warn("[useMeshNetwork] No devices in connectedMap to send message to!");
      console.warn("[useMeshNetwork] connectedDevices state:", connectedDevices);
      // Still add to message history so user sees their own message
      setMessageHistory((p) => [...p, msg]);
      return;
    }

    for (const d of devicesToSend) {
      console.log(`[useMeshNetwork] Attempting to send to device: ${d.id}`);
      sendPromises.push(sendMessageToDevice(d, msg));
    }
    
    // Wait for all sends to complete
    const results = await Promise.allSettled(sendPromises);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[useMeshNetwork] Failed to send to device ${devicesToSend[index].id}:`, result.reason);
      } else {
        console.log(`[useMeshNetwork] Successfully sent to device ${devicesToSend[index].id}`);
      }
    });

    // Add to message history
    setMessageHistory((p) => [...p, msg]);
  };

  /* =======================
     INBOUND (NATIVE ONLY)
  ======================= */

  const handleIncomingMessage = (msg: MeshMessage) => {
    if (!msg?.id || !msg?.sender) return;
  
    // Deduplication
    if (seenIdsRef.current.has(msg.id)) return;
    seenIdsRef.current.add(msg.id);
  
    /* VITAL: Synchronize Peer Visibility
       If we get a message from someone we don't have in our 'connected' list,
       it means they connected to our GATT server. Add them to the UI now.
    */
    const peerDeviceId = msg.sender;
    
    // Check if we already have this peer connected
    // Check if we have a BLE connection mapped to this deviceId
    let peerBleId: string | null = deviceIdToBleIdMap.current.get(peerDeviceId) || null;
    
    // Check if peer is already in connected devices by checking if we have a mapping
    const hasPeerConnection = peerBleId !== null && connectedMap.current.has(peerBleId);
    
    if (!hasPeerConnection) {
      console.log("[Mesh] New peer detected via incoming message:", peerDeviceId);
      
      // Find the BLE device ID - try to match from scanned devices
      // Since devices are auto-connecting, we should have seen them
      if (!peerBleId) {
        // Try to find any scanned device that might be this peer
        // We'll connect to the first available Quakepath device we haven't connected to yet
        for (const [bleId, device] of scannedDeviceMapRef.current.entries()) {
          if (
            !connectedMap.current.has(bleId) &&
            !processingRef.current.has(bleId) &&
            device.serviceUUIDs?.some(
              (uuid) => uuid.toUpperCase() === MESH_SERVICE_UUID.toUpperCase()
            )
          ) {
            peerBleId = bleId;
            break;
          }
        }
      }
      
      // Add to connected devices list (using deviceId as the identifier)
      setConnectedDevices((prev) => {
        if (prev.find(d => d.id === peerDeviceId)) return prev;
        console.log(`[Mesh] Adding peer ${peerDeviceId} to connectedDevices list`);
        return [...prev, {
          id: peerDeviceId,
          name: `Peer ${peerDeviceId.substring(0, 6)}`,
          status: "online",
          lastSeen: new Date(),
        }];
      });
      
      // Don't set isConnected here - wait until we have actual BLE connection
      // updateConnectionState() will be called when reverse connection succeeds
  
      // Connect back to them as a Central so we have a two-way link
      if (peerBleId && !processingRef.current.has(peerBleId) && !connectedMap.current.has(peerBleId)) {
        console.log(`[Mesh] Attempting reverse connection to BLE device: ${peerBleId} for peer ${peerDeviceId}`);
        const bleIdToConnect = peerBleId; // Store for closure
        connectToDevice(bleIdToConnect)
          .then(() => {
            // Store the mapping once connected
            // Check if device is now in connectedMap
            if (connectedMap.current.has(bleIdToConnect)) {
              bleIdToDeviceIdMap.current.set(bleIdToConnect, peerDeviceId);
              deviceIdToBleIdMap.current.set(peerDeviceId, bleIdToConnect);
              console.log(`[Mesh] Reverse connection established: ${bleIdToConnect} <-> ${peerDeviceId}`);
              console.log(`[Mesh] connectedMap now has ${connectedMap.current.size} devices`);
              
              // Update connectedDevices to mark as online (keep deviceId as identifier)
              setConnectedDevices((prev) =>
                prev.map((d) =>
                  d.id === peerDeviceId
                    ? { ...d, lastSeen: new Date(), status: "online" as const }
                    : d
                )
              );
              
              // Now update connection state - we have a real connection
              updateConnectionState();
            } else {
              console.warn(`[Mesh] Connection completed but device ${bleIdToConnect} not in connectedMap`);
            }
          })
          .catch((err) => {
            console.warn(`[Mesh] Reverse connection failed for ${peerBleId}:`, err);
            // Still allow receiving messages, just can't send back yet
          });
      } else if (peerBleId && connectedMap.current.has(peerBleId)) {
        // Already connected, just update the mapping
        console.log(`[Mesh] Already connected to ${peerBleId}, updating mapping for ${peerDeviceId}`);
        bleIdToDeviceIdMap.current.set(peerBleId, peerDeviceId);
        deviceIdToBleIdMap.current.set(peerDeviceId, peerBleId);
        // Update connection state since we have a real connection
        updateConnectionState();
      } else if (!peerBleId) {
        // If we don't have their BLE ID yet, try to find it from scanned devices
        console.log(`[Mesh] Peer deviceId ${peerDeviceId} - BLE ID not found, searching scanned devices...`);
        
        // Try to find any unconnected Quakepath device
        for (const [bleId, device] of scannedDeviceMapRef.current.entries()) {
          if (
            !connectedMap.current.has(bleId) &&
            !processingRef.current.has(bleId) &&
            device.serviceUUIDs?.some(
              (uuid) => uuid.toUpperCase() === MESH_SERVICE_UUID.toUpperCase()
            )
          ) {
            console.log(`[Mesh] Found potential peer BLE device: ${bleId}, attempting connection...`);
            connectToDevice(bleId)
              .then(() => {
                // Store mapping - we'll verify this is the right device when we get their status message
                if (connectedMap.current.has(bleId)) {
                  bleIdToDeviceIdMap.current.set(bleId, peerDeviceId);
                  deviceIdToBleIdMap.current.set(peerDeviceId, bleId);
                  console.log(`[Mesh] Connected to ${bleId}, mapped to ${peerDeviceId}`);
                  // Update connection state since we now have a real connection
                  updateConnectionState();
                }
              })
              .catch((err) => {
                console.warn(`[Mesh] Failed to connect to potential peer ${bleId}:`, err);
              });
            break; // Try one at a time
          }
        }
      }
    } else {
      // Update last seen for existing peer
      setConnectedDevices((prev) =>
        prev.map((d) =>
          d.id === peerDeviceId
            ? { ...d, lastSeen: new Date(), status: "online" as const }
            : d
        )
      );
    }
    
    // Update mapping if we received a status message and now know the connection
    if (msg.type === "status" && peerBleId) {
      bleIdToDeviceIdMap.current.set(peerBleId, peerDeviceId);
      deviceIdToBleIdMap.current.set(peerDeviceId, peerBleId);
    }
  
    // TTL Logic
    if (msg.ttl <= 0) return;
    const forwardMsg = { ...msg, ttl: msg.ttl - 1 };
  
    // Update History & Forwarding
    setMessageHistory((p) => [...p, forwardMsg]);
    messageHandlers.current.forEach((h) => h(forwardMsg));
  
    // Flood to other peers (only if we have a connection to them)
    connectedMap.current.forEach((d, bleId) => {
      const connectedDeviceId = bleIdToDeviceIdMap.current.get(bleId);
      if (connectedDeviceId !== peerDeviceId) {
        sendMessageToDevice(d, forwardMsg);
      }
    });
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;

    // Use global DeviceEventEmitter; our native module emits via DeviceEventManagerModule
    meshEmitterRef.current = new NativeEventEmitter();

    const { MeshAdvertiser } = NativeModules;
    MeshAdvertiser?.startServer?.();

    const sub = meshEmitterRef.current.addListener(
      "MeshMessageReceived",
      (raw: string) => {
        console.log("[useMeshNetwork] received raw message:", raw);
        try {
          const msg = JSON.parse(raw);
          console.log("[useMeshNetwork] parsed message:", msg);
          handleIncomingMessage(msg);
        } catch (e) {
          console.error("[useMeshNetwork] failed to parse incoming message:", e, "raw:", raw);
        }
      }
    );

    return () => {
      sub.remove();
      MeshAdvertiser?.stopServer?.();
    };
  }, []);

  /* =======================
     CLEANUP
  ======================= */

  const disconnectAll = async () => {
    for (const d of connectedMap.current.values()) {
      try {
        await d.cancelConnection();
      } catch {}
    }
    connectedMap.current.clear();
    setConnectedDevices([]);
    setIsConnected(false);
    setLastScanEvent("disconnect_all");
    disconnectSubsRef.current.forEach((remove) => remove());
    disconnectSubsRef.current.clear();
    retryCountsRef.current.clear();
  };

  const sendEmergencyAlert = async (alertData: any) => {
    const content =
      alertData?.message || "Emergency situation detected!";
    await sendMessage(content, "emergency", alertData);
  };

  /* =======================
     PUBLIC API
  ======================= */

  return {
    deviceId: deviceIdRef.current,
    isConnected,
    isScanning,
    isAdvertising,
    connectedDevices,
    scannedDevices,
    scanError,
    lastScanEvent,
    sendMessage,
    connectScannedDevice,
    startScanning: restartScanning,
    stopScanning,
    onMessage: (handler: (m: MeshMessage) => void) => {
      messageHandlers.current.push(handler);
      return () => {
        messageHandlers.current = messageHandlers.current.filter(
          (h) => h !== handler
        );
      };
    },
    onEmergencyAlert: (handler: (a: EmergencyAlert) => void) => {
      alertHandlers.current.push(handler);
      return () => {
        alertHandlers.current = alertHandlers.current.filter(
          (h) => h !== handler
        );
      };
    },
    messageHistory,
    sendEmergencyAlert,
  };
};
