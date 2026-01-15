import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { createEmergencyAlert } from "@/utils/firebaseEmergency";
import { MeshMessage } from "@/hooks/useMeshNetwork";
import { useLocationSync } from "@/hooks/useLocationSync";

interface EmergencyAlertProps {
  onAlertSent?: () => void;
  // Optionally inject mesh controls so we don't create another mesh instance.
  mesh?: {
    isConnected: boolean;
    connectedDevices: Array<{ id: string; name?: string | null }>;
    sendEmergencyAlert: (data: any) => Promise<void>;
    onEmergencyAlert: (handler: (a: { sender: string; data: any }) => void) => () => void;
    deviceId: string;
  };
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  onAlertSent,
  mesh,
}) => {
  // When mesh is not passed, we deliberately fall back to a NOOP state.
  const isConnected = mesh?.isConnected ?? false;
  const connectedDevices = mesh?.connectedDevices ?? [];
  const sendEmergencyAlert = mesh?.sendEmergencyAlert;
  const onEmergencyAlert = mesh?.onEmergencyAlert;
  const deviceId = mesh?.deviceId ?? "unknown";
  const [isSending, setIsSending] = useState(false);
  const { syncLocation } = useLocationSync();

  // Debug logging
  useEffect(() => {
    console.log("Connected Devices:", JSON.stringify(connectedDevices, null, 2));
  }, [connectedDevices]);

  useEffect(() => {
    if (!onEmergencyAlert) return;
    const cleanup = onEmergencyAlert((alert) => {
      // Handle incoming emergency alerts
      Alert.alert(
        "Emergency Alert Received",
        `Emergency alert from ${alert.sender}\n\n${JSON.stringify(alert.data, null, 2)}`,
        [{ text: "OK" }]
      );
    });

    return cleanup;
  }, [onEmergencyAlert]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error("Failed to get location:", error);
      return null;
    }
  };

  const handleEmergencyAlert = async () => {
    if (isSending) return;
    try {
      setIsSending(true);
      if (!sendEmergencyAlert) {
        throw new Error("Mesh not available");
      }
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert(
          "Location Required",
          "Unable to read your location. Please enable location services and try again."
        );
        return;
      }

      const alertData = {
        message: "Emergency situation detected!",
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        timestamp: new Date().toISOString(),
        type: "emergency" as const,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      // Sync location to database (via API or mesh network)
      try {
        console.log('[EmergencyAlert] Syncing location to API/mesh:', {
          deviceId: deviceId || alertData.deviceInfo.platform || "unknown",
          latitude: location.latitude,
          longitude: location.longitude,
        });
        
        await syncLocation({
          deviceId: deviceId || alertData.deviceInfo.platform || "unknown",
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
          timestamp: alertData.timestamp,
          metadata: {
            platform: Platform.OS,
            version: Platform.Version,
            source: 'emergency_alert',
          },
        });
        
        console.log('[EmergencyAlert] Location sync completed');
      } catch (syncError) {
        console.error('[EmergencyAlert] Error syncing location:', syncError);
        // Don't block emergency alert if location sync fails
      }

      await Promise.all([
        sendEmergencyAlert(alertData),
        createEmergencyAlert({
          userId: deviceId || alertData.deviceInfo.platform || "unknown",
          lat: location.latitude,
          lng: location.longitude,
          message: alertData.message,
          initialMessageText: alertData.message,
        }),
      ]);
      onAlertSent?.();

      Alert.alert(
        "Emergency Alert Sent",
        `Alert sent to ${connectedDevices.length} nearby devices.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
      Alert.alert(
        "Error",
        "Failed to send emergency alert. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.alertButton,
          (!isConnected || isSending) && styles.disabledButton,
        ]}
        onPress={handleEmergencyAlert}
        disabled={!isConnected || isSending}
      >
        <MaterialIcons name="warning" size={32} color="white" />
        <Text style={styles.buttonText}>
          {isSending ? "Sending..." : "Emergency Alert"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.statusText}>
        {isConnected
          ? `Connected to ${connectedDevices.length} nearby devices`
          : "Connecting to nearby devices..."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  alertButton: {
    backgroundColor: "#ff3b30",
    borderRadius: 50,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ff9999",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusText: {
    marginTop: 16,
    color: "#666",
    fontSize: 14,
  },
}); 