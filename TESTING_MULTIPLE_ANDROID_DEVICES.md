# Testing with Multiple Android Devices

This guide explains how to build and install the QuakePath app on multiple Android devices to test the Bluetooth mesh network.

## Prerequisites

- At least 2 Android devices (physical devices, not emulators - Bluetooth doesn't work in emulators)
- USB cables for each device
- Android SDK and ADB installed
- Development environment set up

## Method 1: Build and Install via USB (Recommended)

### Step 1: Enable Developer Options on All Devices

On each Android device:
1. Go to **Settings** → **About phone**
2. Tap **Build number** 7 times until you see "You are now a developer!"
3. Go back to **Settings** → **Developer options**
4. Enable **USB debugging**
5. Enable **Stay awake** (keeps screen on while charging - helpful for testing)

### Step 2: Connect Devices to Your Computer

1. Connect all Android devices to your computer via USB
2. On each device, when prompted, allow USB debugging and check "Always allow from this computer"
3. Verify devices are connected:
   ```bash
   adb devices
   ```
   You should see all your devices listed, for example:
   ```
   List of devices attached
   ABC123XYZ    device
   DEF456UVW    device
   GHI789RST    device
   ```

### Step 3: Build and Install on All Devices

#### Option A: Install on All Devices at Once

```bash
# Build the app
npx expo run:android

# This will show a device selection menu - you can only select one at a time
# Instead, build an APK and install it on all devices
```

#### Option B: Build APK and Install on Each Device

1. **Build a development APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   cd ..
   ```
   
   The APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **Install on each device:**
   ```bash
   # Install on device 1
   adb -s DEVICE_ID_1 install android/app/build/outputs/apk/debug/app-debug.apk
   
   # Install on device 2
   adb -s DEVICE_ID_2 install android/app/build/outputs/apk/debug/app-debug.apk
   
   # Install on device 3
   adb -s DEVICE_ID_3 install android/app/build/outputs/apk/debug/app-debug.apk
   
   # Or install on all devices at once
   adb devices | grep "device$" | cut -f1 | xargs -I {} adb -s {} install android/app/build/outputs/apk/debug/app-debug.apk
   ```

   Replace `DEVICE_ID_X` with the actual device IDs from `adb devices`

## Method 2: Build APK and Transfer Manually

### Step 1: Build the APK

```bash
# Make sure you're in the project root
npx expo prebuild
cd android
./gradlew assembleDebug
cd ..
```

### Step 2: Transfer APK to Devices

1. Copy the APK from `android/app/build/outputs/apk/debug/app-debug.apk`
2. Transfer to each device via:
   - Email
   - Google Drive / Dropbox
   - USB file transfer
   - ADB push:
     ```bash
     adb push android/app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/
     ```

### Step 3: Install on Each Device

On each Android device:
1. Open **Files** app
2. Navigate to **Downloads**
3. Tap on `app-debug.apk`
4. If prompted about "Install unknown apps", allow it
5. Tap **Install**
6. Tap **Open** when installation completes

## Method 3: Using Expo Development Build (EAS Build)

If you're using EAS (Expo Application Services):

1. **Build for Android:**
   ```bash
   eas build --platform android --profile development
   ```

2. **Install on devices:**
   - Download the APK from the EAS dashboard
   - Transfer and install on each device as described in Method 2

## Testing the Mesh Network

### Step 1: Prepare All Devices

On each Android device:
1. **Enable Bluetooth:**
   - Swipe down from top → Tap Bluetooth icon
   - Or go to Settings → Connected devices → Bluetooth → Turn on

2. **Grant Permissions:**
   - Open the QuakePath app
   - When prompted, allow:
     - Bluetooth permissions
     - Location permissions (required for BLE scanning on Android)

3. **Navigate to Mesh Screen:**
   - Open the app
   - Go to the **Mesh Network** screen (from the drawer menu)

### Step 2: Verify Device Discovery

1. On each device, you should see:
   - "Network Connected" status
   - "Scanning..." indicator
   - Connected devices list (should populate as devices discover each other)

2. **Wait for connections:**
   - Devices should automatically discover each other within 10-30 seconds
   - Keep devices within 10-30 meters of each other
   - Make sure devices are not in airplane mode

### Step 3: Test Messaging

1. **Send a broadcast message:**
   - On Device 1: Type a message and send (without selecting a recipient)
   - All other devices should receive the message

2. **Send a direct message:**
   - On Device 1: Select a specific device from the recipient chips
   - Type a message and send
   - Only the selected device should receive it

3. **Send emergency alert:**
   - Tap the "Emergency Alert" button
   - All connected devices should receive the alert

## Troubleshooting Multiple Devices

### Devices Not Discovering Each Other

1. **Check Bluetooth status:**
   ```bash
   # On each device, check if Bluetooth is actually on
   # Settings → Connected devices → Bluetooth
   ```

2. **Restart scanning:**
   - Close and reopen the app on all devices
   - Or implement a "Restart Scan" button (you may want to add this)

3. **Check device proximity:**
   - Move devices closer together (within 5-10 meters)
   - Remove obstacles between devices
   - Avoid interference from other Bluetooth devices

4. **Check permissions:**
   ```bash
   # Check if location permission is granted (required for BLE scanning)
   adb shell dumpsys package com.ckrdevelopment.QuakePath | grep permission
   ```

### Connection Issues

1. **Clear app data and restart:**
   ```bash
   adb shell pm clear com.ckrdevelopment.QuakePath
   # Then reopen the app on all devices
   ```

2. **Check BLE service discovery:**
   - Look at device logs to see if services are being discovered
   ```bash
   # View logs from all devices
   adb logcat | grep -i "ble\|bluetooth\|mesh"
   ```

3. **Reboot devices:**
   - Sometimes a simple reboot helps with Bluetooth issues

### Viewing Logs from Multiple Devices

```bash
# View logs from a specific device
adb -s DEVICE_ID logcat | grep -i "QuakePath\|BLE\|Mesh"

# View logs from all devices (requires filtering)
adb devices | grep "device$" | cut -f1 | while read device; do
  echo "=== Logs from $device ==="
  adb -s $device logcat -d | grep -i "QuakePath\|BLE\|Mesh" | tail -20
done
```

## Quick Test Script

Create a script to install on all connected devices:

```bash
#!/bin/bash
# save as install-all-devices.sh

echo "Building APK..."
cd android
./gradlew assembleDebug
cd ..

echo "Installing on all connected devices..."
adb devices | grep "device$" | cut -f1 | while read device; do
  echo "Installing on device: $device"
  adb -s $device install -r android/app/build/outputs/apk/debug/app-debug.apk
done

echo "Done! Open the app on all devices and navigate to Mesh Network screen."
```

Make it executable:
```bash
chmod +x install-all-devices.sh
./install-all-devices.sh
```

## Tips for Testing

1. **Start with 2 devices** to verify basic functionality
2. **Add devices one at a time** to test scalability
3. **Test different scenarios:**
   - Devices joining at different times
   - Devices leaving the network
   - Messages when devices are at different distances
   - Emergency alerts with multiple devices

4. **Monitor battery usage** - BLE scanning can drain battery
5. **Test in different environments:**
   - Indoors vs outdoors
   - With/without obstacles
   - Different distances

## Expected Behavior

- **Device 1** should discover **Device 2** and **Device 3**
- **Device 2** should discover **Device 1** and **Device 3**
- **Device 3** should discover **Device 1** and **Device 2**
- All devices should be able to send messages to each other
- Broadcast messages should reach all connected devices
- Direct messages should only reach the intended recipient

## Notes

- **Maximum connections:** Most Android devices can maintain 5-7 simultaneous BLE connections
- **Range:** BLE typically works within 10-30 meters
- **Discovery time:** Can take 10-30 seconds for devices to discover each other
- **Battery:** Continuous scanning will use more battery - consider implementing scan intervals
