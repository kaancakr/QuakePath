#!/bin/bash

# Script to build and install QuakePath on all connected Android devices
# Works with USB hub (multiple devices via one cable) or wireless ADB

echo "🔍 Checking for connected Android devices..."

# Restart ADB to ensure all devices are detected
adb kill-server > /dev/null 2>&1
sleep 1
adb start-server > /dev/null 2>&1
sleep 2

# Detect both USB and wireless devices
DEVICES=$(adb devices | grep -E "device$|:[0-9]+" | grep -v "List of devices" | cut -f1)

if [ -z "$DEVICES" ]; then
    echo "❌ No Android devices found."
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Connect devices via USB hub (or one at a time)"
    echo "   2. Enable USB debugging: Settings → Developer options → USB debugging"
    echo "   3. For wireless: Enable Wireless debugging in Developer options"
    echo "   4. Run 'adb devices' to verify connections"
    exit 1
fi

DEVICE_COUNT=$(echo "$DEVICES" | wc -l | tr -d ' ')
echo "✅ Found $DEVICE_COUNT device(s):"
echo "$DEVICES" | nl

echo ""
read -p "Continue with build and install? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔨 Building APK..."
cd android
./gradlew assembleDebug
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📦 Installing on all devices..."
SUCCESS_COUNT=0
FAIL_COUNT=0

echo "$DEVICES" | while read device; do
    echo ""
    echo "  📱 Device: $device"
    echo "     Installing..."
    
    # Try to get device model for better logging
    MODEL=$(adb -s "$device" shell getprop ro.product.model 2>/dev/null || echo "Unknown")
    echo "     Model: $MODEL"
    
    adb -s "$device" install -r android/app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        echo "     ✅ Successfully installed"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo "     ❌ Installation failed"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        echo "     💡 Try: adb -s $device uninstall com.ckrdevelopment.QuakePath (to remove old version)"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Installation Summary:"
echo "   Total devices: $DEVICE_COUNT"
echo "   ✅ Successful: $SUCCESS_COUNT"
echo "   ❌ Failed: $FAIL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Next Steps:"
echo "   1. Open the QuakePath app on all devices"
echo "   2. Navigate to the Mesh Network screen"
echo "   3. Enable Bluetooth on all devices"
echo "   4. Grant Bluetooth and Location permissions when prompted"
echo "   5. Keep devices within 10-30 meters of each other"
echo "   6. Wait 10-30 seconds for devices to discover each other"
echo ""
echo "💡 Tips:"
echo "   - Use a USB hub to connect multiple devices with one cable"
echo "   - Or set up wireless ADB for cable-free installation"
echo "   - See docs/ONE_CABLE_MULTIPLE_DEVICES.md for detailed instructions"
