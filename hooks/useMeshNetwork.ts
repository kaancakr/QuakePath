import { useEffect, useState, useCallback, useRef } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import {
  BleManager,
  Device,
  Characteristic,
  Service,
  State,
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
const MESH_ADVERTISING_NAME = "QuakePathMesh";

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

  const meshEmitterRef = useRef<NativeEventEmitter | null>(null);

  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [messageHistory, setMessageHistory] = useState<MeshMessage[]>([]);

  const alertHandlers = useRef<((a: EmergencyAlert) => void)[]>([]);
  const messageHandlers = useRef<((m: MeshMessage) => void)[]>([]);

  /* =======================
     PERMISSIONS
  ======================= */

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return;
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
  };

  /* =======================
     INIT
  ======================= */

  useEffect(() => {
    const init = async () => {
      await requestPermissions();
      const state = await managerRef.current.state();
      if (state === "PoweredOn") {
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

  /* =======================
     MESH START / STOP
  ======================= */

  const startMesh = async () => {
    await startScanning();
    await startAdvertising();
    setIsConnected(true);
  };

  /* =======================
     SCANNING (OUTBOUND ONLY)
  ======================= */

  const startScanning = async () => {
    if (isScanning) return;
    setIsScanning(true);

    managerRef.current.startDeviceScan(null, null, (err, device) => {
      if (err || !device?.id || !device.isConnectable) return;
      if (connectedMap.current.has(device.id)) return;
      if (processingRef.current.has(device.id)) return;
      connectToDevice(device);
    });
  };

  const stopScanning = () => {
    managerRef.current.stopDeviceScan();
    setIsScanning(false);
  };

  /* =======================
     ADVERTISING (NATIVE)
  ======================= */

  const startAdvertising = async () => {
    if (Platform.OS === "android") {
      const ok = await startMeshAdvertising(MESH_SERVICE_UUID, MESH_ADVERTISING_NAME);
      if (ok) {
        setIsAdvertising(true);
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

  const connectToDevice = async (device: Device) => {
    processingRef.current.add(device.id);

    try {
      const d = await device.connect();
      await d.discoverAllServicesAndCharacteristics();

      const services = await d.services();
      const mesh = services.find((s) => s.uuid === MESH_SERVICE_UUID);
      if (!mesh) {
        await d.cancelConnection();
        return;
      }

      connectedMap.current.set(device.id, d);
      setConnectedDevices((p) => [
        ...p,
        {
          id: device.id,
          name: device.name || device.id,
          status: "online",
          lastSeen: new Date(),
          device: d,
        },
      ]);
    } finally {
      processingRef.current.delete(device.id);
    }
  };

  /* =======================
     SEND MESSAGE (OUTBOUND)
  ======================= */

  const sendMessageToDevice = async (device: Device, msg: MeshMessage) => {
    const services = await device.services();
    const mesh = services.find((s) => s.uuid === MESH_SERVICE_UUID);
    if (!mesh) return;

    const chars = await mesh.characteristics();
    const writeChar = chars.find((c) => c.uuid === MESH_CHAR_WRITE);
    if (!writeChar) return;

    await writeChar.writeWithResponse(base64.encode(JSON.stringify(msg)));
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

    for (const d of connectedMap.current.values()) {
      await sendMessageToDevice(d, msg);
    }

    setMessageHistory((p) => [...p, msg]);
  };

  /* =======================
     INBOUND (NATIVE ONLY)
  ======================= */

  const handleIncomingMessage = (msg: MeshMessage) => {
    if (!msg?.id) return;

    if (seenIdsRef.current.has(msg.id)) return;
    seenIdsRef.current.add(msg.id);

    if (seenIdsRef.current.size > MAX_SEEN_IDS) {
      seenIdsRef.current.clear();
    }

    if (msg.ttl <= 0) return;
    msg.ttl -= 1;

    setMessageHistory((p) => [...p, msg]);
    messageHandlers.current.forEach((h) => h(msg));

    if (msg.type === "emergency") {
      alertHandlers.current.forEach((h) =>
        h({ sender: msg.sender, data: msg.data })
      );
    }

    // forward
    connectedMap.current.forEach((d) => {
      if (d.id !== msg.sender) {
        sendMessageToDevice(d, msg);
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
      (raw: string) => handleIncomingMessage(JSON.parse(raw))
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
    sendMessage,
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
