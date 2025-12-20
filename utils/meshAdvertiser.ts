import { NativeModules, Platform } from "react-native";

type MeshAdvertiserNative = {
  startAdvertising?: (serviceUuid: string, localName?: string) => Promise<boolean>;
  stopAdvertising?: () => Promise<boolean>;
};

const native = NativeModules.MeshAdvertiser as MeshAdvertiserNative | undefined;

export const startMeshAdvertising = async (
  serviceUuid: string,
  localName?: string
): Promise<boolean> => {
  if (
    Platform.OS !== "android" ||
    !native ||
    typeof native.startAdvertising !== "function"
  ) {
    return false;
  }
  try {
    return await native.startAdvertising(serviceUuid, localName);
  } catch (e) {
    console.warn("startMeshAdvertising error:", e);
    return false;
  }
};

export const stopMeshAdvertising = async (): Promise<boolean> => {
  if (
    Platform.OS !== "android" ||
    !native ||
    typeof native.stopAdvertising !== "function"
  ) {
    return false;
  }
  try {
    return await native.stopAdvertising();
  } catch (e) {
    console.warn("stopMeshAdvertising error:", e);
    return false;
  }
};

