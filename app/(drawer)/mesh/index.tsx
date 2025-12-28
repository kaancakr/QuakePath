import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Vibration,
} from "react-native";
import { EmergencyAlert } from "@/components/EmergencyAlert";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useMeshNetwork } from "@/hooks/useMeshNetwork";
import * as Notifications from "expo-notifications";

export default function TestMeshScreen() {
  const {
    isConnected,
    isScanning,
    startScanning,
    stopScanning,
    connectedDevices,
    scannedDevices,
    scanError,
    lastScanEvent,
    connectScannedDevice,
    sendEmergencyAlert,
    onEmergencyAlert,
    sendMessage,
    messageHistory,
    deviceId,
  } = useMeshNetwork();
  const { colors, isDarkMode } = useTheme();
  const [messageText, setMessageText] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<
    string | undefined
  >(undefined);
  const messageScrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const previousMessageCount = useRef(messageHistory.length);
  const notificationBorderAnim = useRef(new Animated.Value(0)).current;
  const [showNotificationBorder, setShowNotificationBorder] = useState(false);

  // Play notification sound using expo-notifications
  const playNotificationSound = async () => {
    try {
      // Schedule a local notification with sound (it will play immediately)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Message",
          body: "You have a new message",
          sound: true,
        },
        trigger: null, // null means trigger immediately
      });
    } catch (error) {
      console.log("Notification sound not available, using vibration only");
    }
  };

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  // Handle new message notifications
  useEffect(() => {
    const currentCount = messageHistory.length;
    const previousCount = previousMessageCount.current;

    // Check if a new message arrived (not sent by current user)
    if (currentCount > previousCount && messageHistory.length > 0) {
      const lastMessage = messageHistory[messageHistory.length - 1];
      const isOwnMessage = lastMessage.sender === deviceId;

      // Only notify for messages from others
      if (!isOwnMessage) {
        // Vibrate
        Vibration.vibrate(Platform.OS === "ios" ? [0, 200, 50, 200] : [0, 300, 100, 300]);
        
        // Play sound
        playNotificationSound();

        // Show red border indicator
        setShowNotificationBorder(true);
        notificationBorderAnim.setValue(0);
        Animated.sequence([
          Animated.timing(notificationBorderAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.delay(800),
          Animated.timing(notificationBorderAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setShowNotificationBorder(false);
          notificationBorderAnim.setValue(0);
        });
      }
    }

    previousMessageCount.current = currentCount;

    // Auto-scroll to bottom when new message arrives
    if (messageHistory.length > 0) {
      setTimeout(() => {
        messageScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messageHistory.length, messageHistory, deviceId]);

  const handleAlertSent = () => {
    Alert.alert("Success", "Emergency alert sent to all connected devices", [
      { text: "OK" },
    ]);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    if (!isConnected) {
      Alert.alert("Error", "Not connected to mesh network");
      return;
    }

    try {
      await sendMessage(messageText, "chat");
      setMessageText("");
      setSelectedRecipient(undefined);
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const formatMessageTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getDeviceName = (peerId: string) => {
    return `Device ${peerId.substring(0, 6)}`;
  };

  const getRSSIStrength = (rssi: number | null | undefined) => {
    if (rssi == null) return null;
    if (rssi >= -50) return { label: "Excellent", color: colors.primary };
    if (rssi >= -70) return { label: "Good", color: colors.primary };
    if (rssi >= -85) return { label: "Fair", color: colors.grey };
    return { label: "Weak", color: colors.error };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons
                name="network"
                size={32}
                color={colors.primary}
              />
              <View style={styles.headerTextContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Mesh Network
                </Text>
                <Text style={[styles.subtitle, { color: colors.grey }]}>
                  Emergency Communication System
                </Text>
              </View>
            </View>
          </View>

          {/* Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.card,
                borderColor: isConnected ? colors.primary + "40" : colors.border,
              },
            ]}
          >
            <View style={styles.statusHeader}>
              <Animated.View
                style={[
                  styles.statusIndicator,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: isConnected
                      ? colors.primary + "20"
                      : colors.error + "20",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isConnected ? "wifi" : "wifi-off"}
                  size={32}
                  color={isConnected ? colors.primary : colors.error}
                />
                <View
                  style={[
                    styles.statusPulse,
                    {
                      backgroundColor: isConnected
                        ? colors.primary
                        : colors.error,
                    },
                  ]}
                />
              </Animated.View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>
                  {isConnected ? "Network Active" : "Network Inactive"}
                </Text>
                <Text style={[styles.statusSubtitle, { color: colors.grey }]}>
                  {isConnected
                    ? `${connectedDevices.length} device${connectedDevices.length !== 1 ? "s" : ""} connected`
                    : isScanning
                    ? "Scanning for devices..."
                    : "Tap to start scanning"}
                </Text>
              </View>
            </View>

            {/* Scan Controls */}
            <View style={styles.scanSection}>
              <TouchableOpacity
                style={[
                  styles.scanButton,
                  {
                    backgroundColor: isScanning
                      ? colors.error
                      : colors.primary,
                    opacity: isScanning ? 0.9 : 1,
                  },
                ]}
                onPress={() => (isScanning ? stopScanning() : startScanning())}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={isScanning ? "stop-circle" : "radar"}
                  size={20}
                  color="white"
                />
                <Text style={styles.scanButtonText}>
                  {isScanning ? "Stop Scanning" : "Start Scanning"}
                </Text>
              </TouchableOpacity>
              {scanError && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {scanError}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Connected Devices Summary */}
          {connectedDevices.length > 0 && (
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.card,
                  borderLeftColor: colors.primary,
                  borderLeftWidth: 4,
                },
              ]}
            >
              <View style={styles.summaryHeader}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Connected Devices
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: colors.primary }]}
                  >
                    {connectedDevices.length}
                  </Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.deviceChips}
              >
                {connectedDevices.map((device) => (
                  <View
                    key={device.id}
                    style={[
                      styles.deviceChip,
                      {
                        backgroundColor: colors.primary + "15",
                        borderColor: colors.primary + "40",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.deviceChipText, { color: colors.text }]}
                    >
                      {device.name || device.id.substring(0, 8)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Scanned Devices List */}
          <View
            style={[
              styles.devicesCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="bluetooth"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Available Devices
              </Text>
              {scannedDevices.length > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: colors.primary }]}
                  >
                    {scannedDevices.length}
                  </Text>
                </View>
              )}
            </View>

            {scannedDevices.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name={isScanning ? "radar" : "bluetooth-off"}
                  size={48}
                  color={colors.grey}
                />
                <Text style={[styles.emptyStateText, { color: colors.grey }]}>
                  {isScanning
                    ? "Searching for devices..."
                    : "No devices found. Start scanning to discover nearby devices."}
                </Text>
              </View>
            ) : (
              <View style={styles.deviceList}>
                {scannedDevices.map((device, index) => {
                  const alreadyConnected = connectedDevices.some(
                    (d) => d.id === device.id
                  );
                  const rssiInfo = getRSSIStrength(device.rssi);
                  return (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        styles.deviceRow,
                        index !== scannedDevices.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border + "40",
                        },
                        alreadyConnected && {
                          backgroundColor: colors.primary + "08",
                        },
                      ]}
                      onPress={() => !alreadyConnected && connectScannedDevice(device.id)}
                      disabled={alreadyConnected || device.isConnectable === false}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.deviceIconWrapper,
                          {
                            backgroundColor: alreadyConnected
                              ? colors.primary + "20"
                              : colors.background,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            alreadyConnected
                              ? "check-circle"
                              : device.isConnectable === false
                              ? "bluetooth-off"
                              : "bluetooth-connect"
                          }
                          size={22}
                          color={
                            alreadyConnected
                              ? colors.primary
                              : device.isConnectable === false
                              ? colors.grey
                              : colors.primary
                          }
                        />
                      </View>
                      <View style={styles.deviceInfo}>
                        <Text
                          style={[styles.deviceName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {device.name || `Device ${device.id.substring(0, 8)}`}
                        </Text>
                        <View style={styles.deviceMeta}>
                          {rssiInfo && (
                            <View
                              style={[
                                styles.rssiBadge,
                                { backgroundColor: rssiInfo.color + "20" },
                              ]}
                            >
                              <View
                                style={[
                                  styles.rssiDot,
                                  { backgroundColor: rssiInfo.color },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.rssiText,
                                  { color: rssiInfo.color },
                                ]}
                              >
                                {device.rssi} dBm
                              </Text>
                            </View>
                          )}
                          <Text
                            style={[styles.deviceStatus, { color: colors.grey }]}
                          >
                            {alreadyConnected
                              ? "Connected"
                              : device.isConnectable === false
                              ? "Not available"
                              : "Tap to connect"}
                          </Text>
                        </View>
                      </View>
                      {!alreadyConnected && device.isConnectable !== false && (
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color={colors.grey}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Emergency Alert Section */}
          <View
            style={[
              styles.alertCard,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="alert-octagon"
                size={20}
                color={colors.error}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Emergency Alert
              </Text>
            </View>
            <EmergencyAlert
              onAlertSent={handleAlertSent}
              mesh={{
                isConnected,
                connectedDevices,
                sendEmergencyAlert,
                onEmergencyAlert,
                deviceId,
              }}
            />
          </View>

          {/* Messages Section */}
          <Animated.View
            style={[
              styles.messagesCard,
              { 
                backgroundColor: colors.card,
                borderWidth: notificationBorderAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 4, 0],
                }),
                borderColor: notificationBorderAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['transparent', colors.error, 'transparent'],
                }),
                shadowColor: notificationBorderAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['#000', colors.error, '#000'],
                }),
                shadowOpacity: notificationBorderAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.08, 0.3, 0.08],
                }),
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="message-text"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Messages
              </Text>
              {messageHistory.length > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.badgeText, { color: colors.primary }]}
                  >
                    {messageHistory.length}
                  </Text>
                </View>
              )}
            </View>

            <ScrollView
              ref={messageScrollRef}
              style={styles.messageScroll}
              contentContainerStyle={styles.messageContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {messageHistory.length === 0 ? (
                <View style={styles.emptyMessageState}>
                  <MaterialCommunityIcons
                    name="message-outline"
                    size={56}
                    color={colors.grey + "60"}
                  />
                  <Text
                    style={[styles.emptyMessageText, { color: colors.grey }]}
                  >
                    No messages yet
                  </Text>
                  <Text
                    style={[
                      styles.emptyMessageSubtext,
                      { color: colors.grey },
                    ]}
                  >
                    Start a conversation with connected devices
                  </Text>
                </View>
              ) : (
                messageHistory.map((message) => {
                  const isOwnMessage = message.sender === deviceId;
                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.messageBubble,
                        isOwnMessage ? styles.ownMessage : styles.receivedMessage,
                        {
                          backgroundColor: isOwnMessage
                            ? colors.primary + "25"
                            : isDarkMode
                            ? colors.darkGreen + "60"
                            : colors.sky + "25",
                          borderColor: isOwnMessage
                            ? colors.primary + "40"
                            : colors.border + "40",
                        },
                      ]}
                    >
                      <View style={styles.messageHeaderRow}>
                        <View style={styles.messageSenderRow}>
                          <MaterialCommunityIcons
                            name={
                              isOwnMessage ? "account-circle" : "account"
                            }
                            size={14}
                            color={isOwnMessage ? colors.primary : colors.grey}
                          />
                          <Text
                            style={[
                              styles.messageSender,
                              {
                                color: isOwnMessage
                                  ? colors.primary
                                  : colors.text,
                              },
                            ]}
                          >
                            {isOwnMessage ? "You" : getDeviceName(message.sender)}
                          </Text>
                        </View>
                        <Text
                          style={[styles.messageTime, { color: colors.grey }]}
                        >
                          {formatMessageTime(message.timestamp)}
                        </Text>
                      </View>
                      <Text
                        style={[styles.messageText, { color: colors.text }]}
                      >
                        {message.content}
                      </Text>
                      {message.type !== "chat" && (
                        <View
                          style={[
                            styles.messageTypeTag,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageTypeLabel,
                              { color: colors.primary },
                            ]}
                          >
                            {message.type.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border + "40",
            },
          ]}
        >
          {connectedDevices.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recipientScroll}
              contentContainerStyle={styles.recipientContainer}
            >
              <TouchableOpacity
                onPress={() => setSelectedRecipient(undefined)}
                style={[
                  styles.recipientChip,
                  !selectedRecipient && styles.recipientChipActive,
                  {
                    backgroundColor: !selectedRecipient
                      ? colors.primary
                      : colors.background,
                    borderColor: !selectedRecipient
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.recipientChipText,
                    {
                      color: !selectedRecipient ? "white" : colors.text,
                    },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {connectedDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => setSelectedRecipient(device.id)}
                  style={[
                    styles.recipientChip,
                    selectedRecipient === device.id &&
                      styles.recipientChipActive,
                    {
                      backgroundColor:
                        selectedRecipient === device.id
                          ? colors.primary
                          : colors.background,
                      borderColor:
                        selectedRecipient === device.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.recipientChipText,
                      {
                        color:
                          selectedRecipient === device.id
                            ? "white"
                            : colors.text,
                      },
                    ]}
                  >
                    {device.name || device.id.substring(0, 8)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.grey + "80"}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              editable={isConnected}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!isConnected || !messageText.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    isConnected && messageText.trim()
                      ? colors.primary
                      : colors.grey + "60",
                },
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="send"
                size={22}
                color="white"
              />
            </TouchableOpacity>
          </View>
          {messageText.length > 0 && (
            <Text style={[styles.charCount, { color: colors.grey }]}>
              {messageText.length}/500
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  statusPulse: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    top: 8,
    right: 8,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 13,
  },
  scanSection: {
    gap: 8,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FF000010",
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  deviceChips: {
    marginTop: 4,
  },
  deviceChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  deviceChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  devicesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  deviceList: {
    gap: 0,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  deviceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  deviceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  rssiBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  rssiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rssiText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deviceStatus: {
    fontSize: 12,
  },
  alertCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  messagesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    maxHeight: 400,
    overflow: "hidden",
  },
  messageScroll: {
    maxHeight: 320,
    flexGrow: 0,
  },
  messageContent: {
    paddingBottom: 8,
    flexGrow: 0,
  },
  emptyMessageState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyMessageText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyMessageSubtext: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    maxWidth: "85%",
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageSenderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "600",
  },
  messageTime: {
    fontSize: 10,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTypeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  messageTypeLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    padding: 16,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  recipientScroll: {
    marginBottom: 12,
  },
  recipientContainer: {
    paddingRight: 16,
  },
  recipientChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  recipientChipActive: {
    borderWidth: 2,
  },
  recipientChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 15,
    minHeight: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
    marginRight: 4,
  },
});
