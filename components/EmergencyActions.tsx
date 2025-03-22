import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const EmergencyActions = ({ onEmergencyPress, onShelterPress }: {
  onEmergencyPress: () => void;
  onShelterPress: () => void;
}) => (
  <View style={styles.emergencyButtons}>
    <TouchableOpacity 
      style={[styles.button, styles.emergencyButton]}
      onPress={onEmergencyPress}
    >
      <MaterialIcons name="emergency" size={28} color={Colors.light} />
      <Text style={styles.buttonText}>SOS</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={[styles.button, styles.shelterButton]}
      onPress={onShelterPress}
    >
      <MaterialIcons name="place" size={28} color={Colors.light} />
      <Text style={styles.buttonText}>Shelters</Text>
    </TouchableOpacity>
  </View>
);

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
  emergencyButton: {
    backgroundColor: Colors.red,
  },
  shelterButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: Colors.light,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EmergencyActions;