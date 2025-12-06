# Quick Start: Multiple Devices with One Cable

## 🚀 Fastest Method: USB Hub

1. **Connect all devices to a USB hub** (plugged into your computer)
2. **Run the install script:**
   ```bash
   ./scripts/install-all-devices.sh
   ```
3. **Done!** The script will:
   - Detect all connected devices
   - Build the APK once
   - Install on all devices automatically

## 🔌📶 Mixed Setup: One USB + One Wireless

Perfect when you have one USB cable and want to connect another device wirelessly!

1. **Connect Device 1 via USB:**
   - Enable USB debugging
   - Verify: `adb devices`

2. **Connect Device 2 wirelessly:**
   - On device: Settings → Developer options → Wireless debugging
   - Pair: `adb pair <IP>:<PAIRING_PORT>`
   - Connect: `adb connect <IP>:<DEBUG_PORT>`

3. **Install on both:**
   ```bash
   ./scripts/install-all-devices.sh
   ```
   Or use the mixed setup script:
   ```bash
   ./scripts/quick-mixed-setup.sh
   ```

**See `MIXED_USB_WIRELESS_SETUP.md` for detailed instructions.**

## 📱 Alternative: Build Once, Install Manually

1. **Build the APK:**
   ```bash
   cd android && ./gradlew assembleDebug && cd ..
   ```

2. **Transfer APK to devices:**
   - **Option A:** Use USB hub to push to all devices:
     ```bash
     adb devices | grep "device$" | cut -f1 | xargs -I {} adb -s {} push android/app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/
     ```
   - **Option B:** Upload to Google Drive/Dropbox, download on each device
   - **Option C:** Email the APK to yourself, download on each device

3. **Install on each device:**
   - Open **Files** app → **Downloads**
   - Tap `app-debug.apk` → **Install**

## 🔌 USB Hub Setup

1. Get a **powered USB hub** (recommended for stability)
2. Connect hub to your computer
3. Connect all Android devices to the hub
4. Enable **USB debugging** on each device:
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → Developer options → Enable "USB debugging"

## 📶 Wireless ADB (No Cable After Setup)

1. **First time only:** Connect each device via USB
2. **Enable wireless debugging** on each device
3. **Pair wirelessly** (see `ONE_CABLE_MULTIPLE_DEVICES.md`)
4. **Disconnect USB** - devices stay connected wirelessly
5. **Install on all:**
   ```bash
   ./scripts/install-all-devices.sh
   ```

## ✅ Verify Installation

```bash
# Check all devices are connected
adb devices

# Should show all your devices:
# ABC123XYZ    device
# DEF456UVW    device
# GHI789RST    device
```

## 🎯 Testing the Mesh Network

1. **Open app on all devices**
2. **Navigate to Mesh Network screen**
3. **Enable Bluetooth** on all devices
4. **Grant permissions** when prompted
5. **Wait 10-30 seconds** for devices to discover each other
6. **Send test messages** between devices

## 🆘 Troubleshooting

**Devices not showing?**
```bash
adb kill-server
adb start-server
adb devices
```

**Installation fails?**
```bash
# Uninstall old version first
adb -s DEVICE_ID uninstall com.ckrdevelopment.QuakePath
# Then try installing again
```

**Need more help?** See `ONE_CABLE_MULTIPLE_DEVICES.md` for detailed instructions.
