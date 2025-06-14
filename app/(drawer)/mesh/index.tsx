import React from 'react';
import { View, StyleSheet, ScrollView, Text, Alert } from 'react-native';
import { EmergencyAlert } from '@/components/EmergencyAlert';
import { useMeshNetwork } from '@/hooks/useMeshNetwork';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function TestMeshScreen() {
  const { isConnected, connectedDevices } = useMeshNetwork();
  const { colors, isDarkMode } = useTheme();

  const handleAlertSent = () => {
    Alert.alert(
      'Success',
      'Emergency alert sent to all connected devices',
      [{ text: 'OK' }]
    );
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
  },
}); 