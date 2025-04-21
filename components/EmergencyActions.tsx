import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const EmergencyActions = ({
  onEmergencyPress,
  onShelterPress,
}: {
  onEmergencyPress: () => void;
  onShelterPress: () => void;
}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  return (
    <View style={styles.emergencyButtons}>
      <TouchableOpacity
        style={[styles.button, styles.emergencyButton]}
        onPress={onEmergencyPress}
      >
        <MaterialIcons
          name="emergency"
          size={28}
          color={isDarkMode ? colors.darkCard : colors.card}
        />
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.shelterButton]}
        onPress={onShelterPress}
      >
        <MaterialIcons
          name="place"
          size={28}
          color={isDarkMode ? colors.darkCard : colors.card}
        />
        <Text style={styles.buttonText}>Shelters</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    emergencyButtons: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    button: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emergencyButton: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    shelterButton: {
      backgroundColor: isDarkMode ? colors.darkAccent : colors.accent,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
    buttonText: {
      color: isDarkMode ? colors.darkCard : colors.card,
      fontWeight: "600",
      fontSize: 16,
    },
  });

export default EmergencyActions;
