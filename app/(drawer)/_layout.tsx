import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import type { DrawerNavigationOptions } from '@react-navigation/drawer';

const drawerOptions = {
  headerShown: true,
  drawerActiveTintColor: Colors.teal,
  drawerInactiveTintColor: Colors.grey,
  drawerStyle: {
    backgroundColor: Colors.light,
    width: 250,
  },
  drawerLabelStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
} satisfies DrawerNavigationOptions;

export default function DrawerLayout() {
  return (
    <Drawer
    screenOptions={drawerOptions}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: 'Ana Sayfa',
          drawerIcon: ({ color }: { color: string }) => (
            <FontAwesome5 name="home" size={20} color={color} />
          ),
        } as DrawerNavigationOptions}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          drawerIcon: ({ color }: { color: string }) => (
            <MaterialIcons name="calendar-today" size={20} color={color} />
          ),
        } as DrawerNavigationOptions}
      />
      <Drawer.Screen
        name="payments"
        options={{
          title: 'Payments',
          drawerIcon: ({ color }: { color: string }) => (
            <Feather name="dollar-sign" size={20} color={color} />
          ),
        } as DrawerNavigationOptions}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          drawerIcon: ({ color }: { color: string }) => (
            <FontAwesome5 name="user" size={20} color={color} />
          ),
        } as DrawerNavigationOptions}
      />
    </Drawer>
  );
}