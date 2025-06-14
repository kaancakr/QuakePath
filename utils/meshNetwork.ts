import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

class MeshNetworkService {
  private static instance: MeshNetworkService;
  private isInitialized: boolean = false;
  private connectedDevices: Set<string> = new Set();
  private messageHandlers: ((message: any) => void)[] = [];
  private deviceId: string;
  private isDevelopmentMode: boolean = __DEV__;

  private constructor() {
    this.deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
  }

  public static getInstance(): MeshNetworkService {
    if (!MeshNetworkService.instance) {
      MeshNetworkService.instance = new MeshNetworkService();
    }
    return MeshNetworkService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      if (Platform.OS === 'android') {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          throw new Error('Location permission not granted');
        }
      }

      // Skip Bluetooth check in development mode
      if (!this.isDevelopmentMode && !Device.isDevice) {
        throw new Error('Bluetooth is not available on this device');
      }

      // Start advertising and scanning
      await this.startAdvertising();
      await this.startScanning();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize mesh network:', error);
      throw error;
    }
  }

  private async startAdvertising(): Promise<void> {
    try {
      // In a real implementation, this would use the device's Bluetooth advertising capabilities
      console.log('Started advertising');
    } catch (error) {
      console.error('Failed to start advertising:', error);
    }
  }

  private async startScanning(): Promise<void> {
    try {
      // In a real implementation, this would scan for nearby devices
      console.log('Started scanning');
    } catch (error) {
      console.error('Failed to start scanning:', error);
    }
  }

  public async sendEmergencyAlert(alertData: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Mesh network not initialized');
    }

    const message = {
      type: 'EMERGENCY_ALERT',
      timestamp: Date.now(),
      sender: this.deviceId,
      data: alertData,
    };

    try {
      // In a real implementation, this would send the message to all connected devices
      console.log('Emergency alert sent to all peers:', message);
      this.messageHandlers.forEach(handler => handler(message));
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      throw error;
    }
  }

  public onMessage(handler: (message: any) => void): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: (message: any) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  public getConnectedDevices(): string[] {
    return Array.from(this.connectedDevices);
  }

  public async stop(): Promise<void> {
    try {
      // In a real implementation, this would stop advertising and scanning
      this.connectedDevices.clear();
      this.isInitialized = false;
      console.log('Mesh network stopped');
    } catch (error) {
      console.error('Failed to stop mesh network:', error);
      throw error;
    }
  }
}

export default MeshNetworkService; 