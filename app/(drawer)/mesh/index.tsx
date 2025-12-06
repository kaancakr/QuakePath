import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { EmergencyAlert } from '@/components/EmergencyAlert';
import { useMeshNetwork, MeshMessage } from '@/hooks/useMeshNetwork';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function TestMeshScreen() {
  const { isConnected, connectedDevices, sendMessage, onMessage, messageHistory, clearMessageHistory, deviceId } = useMeshNetwork();
  const { colors, isDarkMode } = useTheme();
  const [messageText, setMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string | undefined>(undefined);

  const handleAlertSent = () => {
    Alert.alert(
      'Success',
      'Emergency alert sent to all connected devices',
      [{ text: 'OK' }]
    );
  };

  // Listen for incoming messages
  useEffect(() => {
    const cleanup = onMessage((message: MeshMessage) => {
      console.log('New message received:', message);
    });
    return cleanup;
  }, [onMessage]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to mesh network');
      return;
    }

    try {
      await sendMessage(messageText, 'chat', selectedRecipient);
      setMessageText('');
      setSelectedRecipient(undefined);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getDeviceName = (deviceId: string) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    return device ? `${device.type} (${deviceId.substring(0, 8)})` : deviceId.substring(0, 8);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Mesh Network</Text>
          <Text style={[styles.subtitle, { color: colors.grey }]}>Emergency Communication System</Text>
        </View>
        
        <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <MaterialCommunityIcons 
                name={isConnected ? "wifi" : "wifi-off"} 
                size={28} 
                color={isConnected ? colors.primary : colors.error} 
              />
              <View style={[
                styles.statusDot,
                { backgroundColor: isConnected ? colors.primary : colors.error }
              ]} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {isConnected ? 'Network Connected' : 'Network Disconnected'}
              </Text>
              <Text style={[styles.statusSubtext, { color: colors.grey }]}>
                {isConnected ? 'Ready to communicate' : 'Searching for network...'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.deviceStats, { 
            backgroundColor: isDarkMode ? colors.darkGreen : colors.sky + '20',
            borderColor: isDarkMode ? colors.darkGreen : colors.sky
          }]}>
            <View style={[styles.deviceIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="devices" size={24} color={colors.primary} />
            </View>
            <View style={styles.deviceTextContainer}>
              <Text style={[styles.deviceCount, { color: colors.text }]}>
                {connectedDevices.length}
              </Text>
              <Text style={[styles.deviceText, { color: colors.grey }]}>
                Device{connectedDevices.length !== 1 ? 's' : ''} Connected
              </Text>
            </View>
          </View>

          {connectedDevices.length > 0 && (
            <View style={[styles.deviceList, { 
              backgroundColor: isDarkMode ? colors.darkGreen : colors.sky + '20',
              borderColor: isDarkMode ? colors.darkGreen : colors.sky
            }]}>
              <Text style={[styles.deviceListTitle, { color: colors.text }]}>Connected Devices</Text>
              {connectedDevices.map((device, index) => (
                <View key={device.id} style={[styles.deviceItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.deviceItemIcon, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="cellphone" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.deviceItemContent}>
                    <Text style={[styles.deviceItemText, { color: colors.text }]}>
                      {device.type || `Device ${index + 1}`}
                    </Text>
                    <Text style={[styles.deviceItemId, { color: colors.grey }]}>
                      ID: {device.id}
                    </Text>
                    <Text style={[styles.deviceItemId, { color: colors.grey }]}>
                      Last seen: {new Date(device.lastSeen).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.alertContainer, { backgroundColor: colors.card }]}>
          <EmergencyAlert onAlertSent={handleAlertSent} />
        </View>

        {/* Message History */}
        <View style={[styles.messageContainer, { backgroundColor: colors.card }]}>
          <View style={styles.messageHeader}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>Messages</Text>
            {messageHistory.length > 0 && (
              <TouchableOpacity
                onPress={clearMessageHistory}
                style={[styles.clearButton, { backgroundColor: colors.error + '20' }]}
              >
                <Text style={[styles.clearButtonText, { color: colors.error }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView 
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
          >
            {messageHistory.length === 0 ? (
              <View style={styles.emptyMessageContainer}>
                <MaterialCommunityIcons name="message-outline" size={48} color={colors.grey} />
                <Text style={[styles.emptyMessageText, { color: colors.grey }]}>
                  No messages yet. Start a conversation!
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
                          ? colors.primary + '20' 
                          : isDarkMode ? colors.darkGreen : colors.sky + '20',
                        borderColor: isOwnMessage ? colors.primary : colors.border,
                      }
                    ]}
                  >
                    <View style={styles.messageHeaderBubble}>
                      <Text style={[styles.messageSender, { color: colors.text }]}>
                        {isOwnMessage ? 'You' : getDeviceName(message.sender)}
                      </Text>
                      <Text style={[styles.messageTime, { color: colors.grey }]}>
                        {formatMessageTime(message.timestamp)}
                      </Text>
                    </View>
                    <Text style={[styles.messageContent, { color: colors.text }]}>
                      {message.content}
                    </Text>
                    {message.type !== 'chat' && (
                      <View style={styles.messageTypeBadge}>
                        <Text style={[styles.messageTypeText, { color: colors.primary }]}>
                          {message.type}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {connectedDevices.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recipientSelector}
              >
                <TouchableOpacity
                  onPress={() => setSelectedRecipient(undefined)}
                  style={[
                    styles.recipientChip,
                    !selectedRecipient && styles.selectedRecipientChip,
                    { 
                      backgroundColor: !selectedRecipient ? colors.primary : colors.background,
                      borderColor: colors.border 
                    }
                  ]}
                >
                  <Text style={[
                    styles.recipientChipText,
                    { color: !selectedRecipient ? 'white' : colors.text }
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                {connectedDevices
                  .filter(d => d.id !== deviceId)
                  .map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      onPress={() => setSelectedRecipient(device.id)}
                      style={[
                        styles.recipientChip,
                        selectedRecipient === device.id && styles.selectedRecipientChip,
                        { 
                          backgroundColor: selectedRecipient === device.id ? colors.primary : colors.background,
                          borderColor: colors.border 
                        }
                      ]}
                    >
                      <Text style={[
                        styles.recipientChipText,
                        { color: selectedRecipient === device.id ? 'white' : colors.text }
                      ]}>
                        {device.type} ({device.id.substring(0, 6)})
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.messageInput, { 
                  color: colors.text, 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }]}
                placeholder="Type a message..."
                placeholderTextColor={colors.grey}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!isConnected || !messageText.trim()}
                style={[
                  styles.sendButton,
                  { 
                    backgroundColor: isConnected && messageText.trim() ? colors.primary : colors.grey,
                  }
                ]}
              >
                <MaterialCommunityIcons name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  statusContainer: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
  },
  deviceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceTextContainer: {
    flex: 1,
  },
  deviceCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  deviceText: {
    fontSize: 14,
  },
  deviceList: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  deviceListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deviceItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceItemContent: {
    flex: 1,
  },
  deviceItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  deviceItemId: {
    fontSize: 12,
  },
  alertContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  messageContainer: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
    maxHeight: 400,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageList: {
    maxHeight: 300,
  },
  messageListContent: {
    paddingBottom: 8,
  },
  emptyMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyMessageText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    maxWidth: '85%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageHeaderBubble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 10,
    marginLeft: 8,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTypeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  messageTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  recipientSelector: {
    marginBottom: 12,
    maxHeight: 40,
  },
  recipientChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  selectedRecipientChip: {
    borderWidth: 2,
  },
  recipientChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 