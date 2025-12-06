#!/bin/bash

# Quick setup script for mixed USB + Wireless ADB setup

echo "🔌 Mixed USB + Wireless ADB Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check USB devices
USB_DEVICES=$(adb devices | grep "device$" | grep -v ":" | cut -f1)
USB_COUNT=$(echo "$USB_DEVICES" | grep -v "^$" | wc -l | tr -d ' ')

# Check wireless devices
WIRELESS_DEVICES=$(adb devices | grep ":" | grep "device$" | cut -f1)
WIRELESS_COUNT=$(echo "$WIRELESS_DEVICES" | grep -v "^$" | wc -l | tr -d ' ')

echo "📱 Connected Devices:"
echo "   USB: $USB_COUNT device(s)"
if [ "$USB_COUNT" -gt 0 ]; then
    echo "$USB_DEVICES" | while read device; do
        MODEL=$(adb -s "$device" shell getprop ro.product.model 2>/dev/null || echo "Unknown")
        echo "      - $device ($MODEL)"
    done
fi

echo "   Wireless: $WIRELESS_COUNT device(s)"
if [ "$WIRELESS_COUNT" -gt 0 ]; then
    echo "$WIRELESS_DEVICES" | while read device; do
        MODEL=$(adb -s "$device" shell getprop ro.product.model 2>/dev/null || echo "Unknown")
        echo "      - $device ($MODEL)"
    done
fi

echo ""

if [ "$USB_COUNT" -eq 0 ] && [ "$WIRELESS_COUNT" -eq 0 ]; then
    echo "❌ No devices connected!"
    echo ""
    echo "To set up:"
    echo "1. Connect one device via USB"
    echo "2. For wireless device:"
    echo "   - Enable Wireless debugging in Developer options"
    echo "   - Get IP, port, and pairing code"
    echo "   - Run: adb pair <IP>:<PAIRING_PORT>"
    echo "   - Run: adb connect <IP>:<DEBUG_PORT>"
    echo ""
    echo "See MIXED_USB_WIRELESS_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ Ready to install!"
echo ""
read -p "Install QuakePath on all devices? (y/n) " -n 1 -r
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
ALL_DEVICES=$(adb devices | grep -E "device$|:" | grep -v "List of devices" | cut -f1)

echo "$ALL_DEVICES" | while read device; do
    echo ""
    if [[ $device == *":"* ]]; then
        echo "  📶 Wireless: $device"
    else
        echo "  🔌 USB: $device"
    fi
    
    MODEL=$(adb -s "$device" shell getprop ro.product.model 2>/dev/null || echo "Unknown")
    echo "     Model: $MODEL"
    echo "     Installing..."
    
    adb -s "$device" install -r android/app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        echo "     ✅ Success"
    else
        echo "     ❌ Failed"
    fi
done

echo ""
echo "✨ Done! Open QuakePath on all devices and test the mesh network."
