# Mixed Setup: One USB Cable + One Wireless

This guide shows how to install on multiple devices when you have:
- **One device** connected via USB cable
- **One or more devices** connected wirelessly (Wireless ADB)

## Step 1: Connect Devices

### Device 1: USB Connection
1. Connect device via USB cable
2. Enable **USB debugging**:
   - Settings → Developer options → USB debugging
3. Verify connection:
   ```bash
   adb devices
   ```
   Should show: `ABC123XYZ    device`

### Device 2 (and more): Wireless Connection

1. **On the wireless device:**
   - Go to **Settings** → **Developer options**
   - Enable **Wireless debugging**
   - Tap **Wireless debugging**
   - Tap **Pair device with pairing code**
   - **Note down:**
     - IP address (e.g., `192.168.1.100`)
     - Pairing port (e.g., `12345`)
     - Pairing code (e.g., `123456`)

2. **On your computer, pair the device:**
   ```bash
   adb pair <IP_ADDRESS>:<PAIRING_PORT>
   ```
   Example:
   ```bash
   adb pair 192.168.1.100:12345
   ```
   Enter the pairing code when prompted.

3. **Connect wirelessly:**
   ```bash
   adb connect <IP_ADDRESS>:<DEBUG_PORT>
   ```
   The debug port is usually `5555` or shown in the Wireless debugging screen.

   Example:
   ```bash
   adb connect 192.168.1.100:5555
   ```

4. **Verify both devices are connected:**
   ```bash
   adb devices
   ```
   Should show:
   ```
   List of devices attached
   ABC123XYZ        device          (USB)
   192.168.1.100:5555    device    (Wireless)
   ```

## Step 2: Install on All Devices

### Option A: Use the Install Script

The script automatically detects both USB and wireless devices:

```bash
./scripts/install-all-devices.sh
```

It will:
- Detect the USB device
- Detect the wireless device(s)
- Build the APK once
- Install on all devices

### Option B: Manual Installation

1. **Build the APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   cd ..
   ```

2. **Install on USB device:**
   ```bash
   adb -s ABC123XYZ install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Install on wireless device:**
   ```bash
   adb -s 192.168.1.100:5555 install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Or install on all at once:**
   ```bash
   adb devices | grep -E "device$|5555" | cut -f1 | xargs -I {} adb -s {} install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Quick Setup Script

Run this to set up wireless ADB for a device:

```bash
./scripts/setup-wireless-adb.sh
```

Then follow the on-screen instructions.

## Troubleshooting

### Wireless Device Not Connecting

1. **Check Wi-Fi:**
   - Ensure device and computer are on the **same Wi-Fi network**
   - Check firewall settings (may block ADB ports)

2. **Re-pair if needed:**
   ```bash
   adb pair <IP>:<PAIRING_PORT>
   adb connect <IP>:<DEBUG_PORT>
   ```

3. **Check connection:**
   ```bash
   adb devices
   ```

### USB Device Not Showing

1. **Restart ADB:**
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

2. **Check USB debugging:**
   - Settings → Developer options → USB debugging (should be enabled)
   - Try revoking USB debugging authorizations and re-authorizing

### Installation Fails on One Device

1. **Uninstall old version:**
   ```bash
   # For USB device
   adb -s DEVICE_ID uninstall com.ckrdevelopment.QuakePath
   
   # For wireless device
   adb -s IP:PORT uninstall com.ckrdevelopment.QuakePath
   ```

2. **Try installing again**

## Example Workflow

```bash
# 1. Connect USB device
adb devices
# Output: ABC123XYZ    device

# 2. Set up wireless device (on device: enable wireless debugging)
# Get IP and pairing code from device

# 3. Pair wireless device
adb pair 192.168.1.100:12345
# Enter pairing code: 123456

# 4. Connect wirelessly
adb connect 192.168.1.100:5555

# 5. Verify both are connected
adb devices
# Output:
# ABC123XYZ        device
# 192.168.1.100:5555    device

# 6. Install on all devices
./scripts/install-all-devices.sh
```

## Tips

- **Keep wireless device charged** - wireless ADB can drain battery faster
- **Stay on same Wi-Fi** - wireless connection drops if device leaves network
- **USB device can be disconnected** after wireless setup is complete
- **Label your devices** - use `adb devices` output to identify which is which
- **Test one device first** - verify installation works before setting up multiple

## Advantages of Mixed Setup

✅ **Flexibility** - One device can stay connected via USB (stable)  
✅ **Mobility** - Wireless device can move around  
✅ **No USB hub needed** - Works with just one USB cable  
✅ **Easy to add more** - Can add more wireless devices easily  

## Next Steps

After installation:
1. Open QuakePath app on all devices
2. Navigate to Mesh Network screen
3. Enable Bluetooth on all devices
4. Grant permissions
5. Test messaging between devices
