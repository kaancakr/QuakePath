import React from "react";
import { Drawer } from "expo-router/drawer";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import type { DrawerNavigationOptions } from "@react-navigation/drawer";

const drawerOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: Colors.light,
    shadowColor: "transparent",
    height: 110,
  },
  headerTitleStyle: {
    color: Colors.dark,
    fontSize: 18,
    fontWeight: "bold",
  },
  drawerActiveTintColor: "#fff",
  drawerInactiveTintColor: Colors.grey,
  drawerActiveBackgroundColor: Colors.teal,
  drawerStyle: {
    backgroundColor: "#f9f9f9",
    width: 250,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 10,
  },
  drawerLabelStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
  drawerItemStyle: {
    borderRadius: 15,
  },
} satisfies DrawerNavigationOptions;

export default function DrawerLayout() {
  return (
    <Drawer screenOptions={drawerOptions}>
      <Drawer.Screen
        name="dashboard/index"
        options={{
          title: "Ana Sayfa",
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="home" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: "Bookings",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="calendar-today" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="payments"
        options={{
          title: "Payments",
          drawerIcon: ({ color }) => (
            <Feather name="dollar-sign" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="user" size={20} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
