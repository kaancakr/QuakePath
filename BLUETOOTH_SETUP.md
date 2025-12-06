# Bluetooth Mesh Network Setup

This app now uses Bluetooth Low Energy (BLE) for direct device-to-device mesh networking instead of requiring a local network server.

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Rebuild the app with Expo development build:**
   
   Since `react-native-ble-plx` requires native code, you need to create a new development build:
   
   ```bash
   # For iOS
   npx expo run:ios
   
   # For Android
   npx expo run:android
   ```
   
   **Note:** You cannot use Expo Go for Bluetooth functionality. You must use a development build.

3. **Permissions:**
   - The app will automatically request Bluetooth permissions on first launch
   - On Android, you may also need to grant location permissions (required for BLE scanning)

## How It Works

### Device Discovery
- Devices continuously scan for nearby devices advertising the QuakePath mesh service
- When a device is found, it automatically connects and establishes a BLE connection
- Each device maintains a list of connected peers

### Message Sending
- Messages are sent via BLE characteristics
- You can send messages to specific devices or broadcast to all connected devices
- Messages are automatically relayed through the mesh network

### Service UUIDs
- **Service UUID:** `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
- **Write Characteristic:** `6E400002-B5A3-F393-E0A9-E50E24DCCA9E`
- **Read Characteristic:** `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`

## Limitations

1. **Peripheral Mode:** The current implementation uses central mode (scanning and connecting). For true mesh networking where devices can both advertise and scan, you would need to implement peripheral mode using native code or a different library.

2. **Range:** BLE has a typical range of 10-30 meters, depending on environment and device capabilities.

3. **Connection Limits:** Most devices can maintain 5-7 simultaneous BLE connections.

## Testing

1. Build and install the app on at least 2 physical devices
2. Enable Bluetooth on both devices
3. Open the Mesh Network screen on both devices
4. The devices should automatically discover and connect to each other
5. Try sending messages between devices

## Troubleshooting

- **Devices not discovering each other:**
  - Ensure Bluetooth is enabled on both devices
  - Check that both devices have granted Bluetooth permissions
  - Try moving devices closer together
  - Restart the app on both devices

- **Connection failures:**
  - Ensure both devices are running the development build (not Expo Go)
  - Check device logs for error messages
  - Try disconnecting and reconnecting

- **Messages not received:**
  - Verify devices are connected (check the connected devices list)
  - Check that the mesh service and characteristics are properly discovered
  - Review device logs for transmission errors
