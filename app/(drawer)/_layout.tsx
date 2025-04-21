import React from "react";
import { Drawer } from "expo-router/drawer";
import {
  FontAwesome5,
  MaterialIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import type { DrawerNavigationOptions } from "@react-navigation/drawer";
import { useTheme } from "@/context/ThemeContext";

const DrawerLayout = () => {
  const { colors, isDarkMode } = useTheme();

  const drawerOptions: DrawerNavigationOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: isDarkMode ? Colors.darkHeaderBackground : Colors.headerBackground,
      shadowColor: "transparent",
      height: 110,
      elevation: 0,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.border,
    },
    headerTitleStyle: {
      color: isDarkMode ? Colors.darkHeaderText : Colors.headerText,
      fontSize: 20,
      fontWeight: "600",
    },
    headerTintColor: isDarkMode ? Colors.darkHeaderText : Colors.headerText,
    drawerActiveTintColor: isDarkMode ? Colors.darkText : Colors.text,
    drawerInactiveTintColor: isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary,
    drawerActiveBackgroundColor: isDarkMode ? Colors.darkSelected : Colors.selected,
    drawerStyle: {
      backgroundColor: isDarkMode ? Colors.darkBackground : Colors.background,
      width: 280,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      borderRightWidth: 1,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
    },
    drawerLabelStyle: {
      fontSize: 16,
      fontWeight: "500",
      marginLeft: -10,
    },
    drawerItemStyle: {
      borderRadius: 12,
      paddingLeft: 12,
      marginHorizontal: 8,
      marginVertical: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
    },
  };

  const iconStyle = {
    width: 24,
    alignItems: "center" as const,
    marginRight: 12,
  };

  return (
    <Drawer screenOptions={drawerOptions}>
      <Drawer.Screen
        name="dashboard/index"
        options={{
          title: "Ana Sayfa",
          drawerIcon: ({ color }) => (
            <FontAwesome5
              name="home"
              size={20}
              color={color}
              style={iconStyle}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: "Bookings",
          drawerIcon: ({ color }) => (
            <MaterialIcons
              name="calendar-today"
              size={20}
              color={color}
              style={iconStyle}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="payments"
        options={{
          title: "Payments",
          drawerIcon: ({ color }) => (
            <Feather
              name="dollar-sign"
              size={20}
              color={color}
              style={iconStyle}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color }) => (
            <FontAwesome5
              name="user"
              size={20}
              color={color}
              style={iconStyle}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="help/index"
        options={{
          title: "Help",
          drawerIcon: ({ color }) => (
            <MaterialIcons
              name="help"
              size={20}
              color={color}
              style={iconStyle}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          title: "Settings",
          drawerIcon: ({ color }) => (
            <MaterialIcons
              name="settings"
              size={20}
              color={color}
              style={iconStyle}
            />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
