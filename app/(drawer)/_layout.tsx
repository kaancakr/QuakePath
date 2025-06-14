import React from "react";
import { Drawer } from "expo-router/drawer";
import {
  FontAwesome5,
  MaterialIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";
import type { DrawerNavigationOptions } from "@react-navigation/drawer";
import { useTheme } from "@/context/ThemeContext";
import { Platform } from "react-native";

const DrawerLayout = () => {
  const { colors, isDarkMode } = useTheme();

  const drawerOptions: DrawerNavigationOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.light,
      height: Platform.OS === "ios" ? 110 : 50,
    },
    headerTintColor: colors.headerText,
    drawerActiveTintColor: colors.primary,
    drawerInactiveTintColor: colors.grey,
    drawerActiveBackgroundColor: isDarkMode ? colors.darkGreen : colors.teal,
    drawerStyle: {
      backgroundColor: colors.background,
      width: 250,
      paddingVertical: 10,
    },
    drawerLabelStyle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    drawerItemStyle: {
      borderRadius: 15,
    },
  };

  return (
    <Drawer screenOptions={drawerOptions}>
      <Drawer.Screen
        name="emergency/index"
        options={{
          title: "Acil Durum",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="emergency" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="mesh/index"
        options={{
          title: "Mesh Ağı",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="wifi" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="dashboard/index"
        options={{
          title: "Ana Sayfa",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="help/index"
        options={{
          title: "Yardım",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="help" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile/index"
        options={{
          title: "Profil",
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="user" size={20} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          title: "Ayarlar",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
