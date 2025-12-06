#!/bin/bash

# Script to help set up wireless ADB for multiple devices
# This allows you to connect devices wirelessly after initial USB setup

echo "📶 Wireless ADB Setup Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if any devices are connected
CONNECTED=$(adb devices | grep "device$" | wc -l | tr -d ' ')

if [ "$CONNECTED" -eq 0 ]; then
    echo "❌ No devices connected via USB."
    echo ""
    echo "Please:"
    echo "1. Connect a device via USB"
    echo "2. Enable USB debugging"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Found $CONNECTED device(s) connected via USB"
echo ""

echo "For each device, follow these steps:"
echo ""
echo "1. On the device:"
echo "   - Go to Settings → Developer options"
echo "   - Enable 'Wireless debugging'"
echo "   - Tap 'Wireless debugging'"
echo "   - Tap 'Pair device with pairing code'"
echo "   - Note the IP address, port, and pairing code"
echo ""
echo "2. On your computer, run:"
echo "   adb pair <IP>:<PAIRING_PORT>"
echo "   (Enter the pairing code when prompted)"
echo ""
echo "3. Then connect:"
echo "   adb connect <IP>:<DEBUG_PORT>"
echo ""
echo "4. Disconnect USB and repeat for next device"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Do you want to see the currently connected devices? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Currently connected devices:"
    adb devices
    echo ""
fi

echo ""
echo "💡 After setting up wireless ADB, you can:"
echo "   - Disconnect all USB cables"
echo "   - Connect devices wirelessly: adb connect <IP>:<PORT>"
echo "   - Install on all devices: ./scripts/install-all-devices.sh"
echo ""
