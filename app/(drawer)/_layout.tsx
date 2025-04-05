import React from "react";
import { Drawer } from "expo-router/drawer";
import { FontAwesome5, MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import type { DrawerNavigationOptions } from "@react-navigation/drawer";
import { useTheme } from "@/context/ThemeContext";

const DrawerLayout = () => {
  const { colors, isDarkMode } = useTheme();

  const drawerOptions: DrawerNavigationOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.headerBackground,
      shadowColor: "transparent",
      height: 110,
    },
    headerTitleStyle: {
      color: colors.headerText,
      fontSize: 18,
      fontWeight: "bold",
    },
    headerTintColor: colors.headerText,
    drawerActiveTintColor: colors.light,
    drawerInactiveTintColor: colors.grey,
    drawerActiveBackgroundColor: isDarkMode ? colors.darkGreen : colors.teal,
    drawerStyle: {
      backgroundColor: colors.card,
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
  };

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
      <Drawer.Screen 
        name="help/index"
        options={{
          title: "Help",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="help" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          title: "Settings",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="settings" size={20} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;