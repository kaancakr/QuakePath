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
  const { colors } = useTheme();

  return (
    <View style={styles.emergencyButtons}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.error }]}
        onPress={onEmergencyPress}
      >
        <MaterialIcons name="emergency" size={28} color={colors.light} />
        <Text style={[styles.buttonText, { color: colors.light }]}>SOS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onShelterPress}
      >
        <MaterialIcons name="place" size={28} color={colors.light} />
        <Text style={[styles.buttonText, { color: colors.light }]}>Shelters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmergencyActions;
