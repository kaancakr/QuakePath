# Installing on Multiple Devices with One USB Cable

This guide shows you how to install the QuakePath app on multiple Android devices when you only have one USB cable available.

## Method 1: USB Hub (Easiest)

### Step 1: Connect Devices via USB Hub

1. Get a USB hub (powered USB hub recommended for better stability)
2. Connect the USB hub to your computer
3. Connect all Android devices to the USB hub
4. Enable USB debugging on each device (Settings → Developer options → USB debugging)

### Step 2: Verify All Devices Are Connected

```bash
adb devices
```

You should see all devices listed:
```
List of devices attached
ABC123XYZ    device
DEF456UVW    device
GHI789RST    device
```

### Step 3: Install on All Devices

```bash
# Build the APK first
cd android
./gradlew assembleDebug
cd ..

# Install on all connected devices at once
adb devices | grep "device$" | cut -f1 | xargs -I {} adb -s {} install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Or use the provided script:
```bash
./scripts/install-all-devices.sh
```

## Method 2: Wireless ADB (No Cable Needed After Setup)

This method allows you to connect devices wirelessly after initial setup.

### Step 1: Initial Setup (One Device at a Time)

1. **Connect first device via USB:**
   ```bash
   adb devices
   ```

2. **Enable wireless debugging on the device:**
   - Go to **Settings** → **Developer options**
   - Enable **Wireless debugging**
   - Tap **Wireless debugging** → **Pair device with pairing code**
   - Note the **IP address and port** (e.g., `192.168.1.100:12345`)
   - Note the **pairing code**

3. **Connect wirelessly:**
   ```bash
   # Pair using the code
   adb pair <IP_ADDRESS>:<PAIRING_PORT>
   # Enter the pairing code when prompted
   
   # Connect to the device
   adb connect <IP_ADDRESS>:<DEBUG_PORT>
   ```

4. **Disconnect USB** - the device should still be connected wirelessly

5. **Repeat for other devices** - connect each device via USB once to enable wireless debugging, then disconnect

### Step 2: Connect All Devices Wirelessly

Once all devices are set up for wireless debugging:

```bash
# Connect to all devices (replace with your actual IPs and ports)
adb connect 192.168.1.100:5555
adb connect 192.168.1.101:5555
adb connect 192.168.1.102:5555

# Verify all devices are connected
adb devices
```

### Step 3: Install on All Devices

```bash
# Build APK
cd android
./gradlew assembleDebug
cd ..

# Install on all wireless devices
adb devices | grep -E "device$|5555" | cut -f1 | xargs -I {} adb -s {} install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Method 3: Build APK Once, Transfer to Devices

This method requires building the APK once, then transferring it to each device.

### Step 1: Build APK

```bash
cd android
./gradlew assembleDebug
cd ..
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 2: Transfer APK to Devices

#### Option A: Using ADB (One Device at a Time)

1. Connect device via USB
2. Transfer APK:
   ```bash
   adb push android/app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/quakepath.apk
   ```
3. Disconnect and connect next device
4. Repeat for each device

#### Option B: Using Cloud Storage

1. Upload APK to Google Drive, Dropbox, or similar
2. On each device:
   - Open the cloud storage app
   - Download the APK
   - Open **Files** app → **Downloads**
   - Tap the APK to install
   - Allow "Install unknown apps" if prompted

#### Option C: Using Email

1. Email the APK to yourself
2. On each device:
   - Open email app
   - Download the APK attachment
   - Install from Downloads folder

#### Option D: Using Nearby Share / Quick Share

1. On your computer, share the APK file via Nearby Share (if available)
2. Or use Quick Share / AirDrop equivalent
3. Accept on each device

### Step 3: Install on Each Device

On each Android device:
1. Open **Files** app
2. Navigate to **Downloads**
3. Tap `app-debug.apk` or `quakepath.apk`
4. Tap **Install**
5. Allow installation if prompted

## Method 4: USB Cable Rotation (One at a Time)

If you only have one cable and no USB hub:

### Step 1: Build APK Once

```bash
cd android
./gradlew assembleDebug
cd ..
```

### Step 2: Install on Each Device Sequentially

```bash
# Device 1
adb devices  # Verify device is connected
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Disconnect device 1, connect device 2
adb devices  # Verify new device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Disconnect device 2, connect device 3
adb devices  # Verify new device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Continue for all devices...
```

## Quick Script for USB Hub Method

Create this script to install on all devices connected via USB hub:

```bash
#!/bin/bash
# save as install-via-usb-hub.sh

echo "Building APK..."
cd android
./gradlew assembleDebug
cd ..

echo "Installing on all connected devices..."
for device in $(adb devices | grep "device$" | cut -f1); do
    echo "Installing on device: $device"
    adb -s "$device" install -r android/app/build/outputs/apk/debug/app-debug.apk
done

echo "Done!"
```

## Troubleshooting

### Devices Not Showing Up

1. **Check USB connection:**
   ```bash
   adb devices
   ```

2. **Restart ADB server:**
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

3. **Check USB debugging:**
   - On each device: Settings → Developer options → USB debugging (should be enabled)
   - Try revoking USB debugging authorizations and re-authorizing

4. **Try different USB ports** on your computer

5. **Use a powered USB hub** if devices aren't getting enough power

### Installation Fails

1. **Uninstall old version first:**
   ```bash
   adb -s DEVICE_ID uninstall com.ckrdevelopment.QuakePath
   ```

2. **Check available storage** on devices

3. **Enable "Install via USB"** in Developer options

### Wireless ADB Issues

1. **Ensure devices are on same Wi-Fi network** as your computer

2. **Check firewall settings** - may need to allow ADB connections

3. **Reconnect if connection drops:**
   ```bash
   adb disconnect
   adb connect <IP>:<PORT>
   ```

## Recommended Approach

**For testing with multiple devices, I recommend:**

1. **Use a USB hub** (Method 1) - fastest and most reliable
2. **Or use wireless ADB** (Method 2) - most convenient after initial setup
3. **Or build APK and transfer** (Method 3) - good if you have many devices or limited USB ports

## Tips

- **Label your devices** - use `adb devices` to see device IDs, then label each device
- **Keep devices charged** - USB debugging can drain battery
- **Use a powered USB hub** - ensures stable connections
- **Test one device first** - verify the app works before installing on all devices
- **Keep APK file** - save the APK so you can install on new devices without rebuilding
