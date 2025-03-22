import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const NavigationModal = ({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal transparent visible={visible}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Initiate Emergency Navigation?</Text>
        <MaterialIcons name="warning" size={40} color={Colors.red} />
        <Text style={styles.modalText}>
          This route may pass through affected areas. Proceed with caution!
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.navigateButton]}
            onPress={onConfirm}
          >
            <FontAwesome6
              name="person-walking"
              size={20}
              color={Colors.light}
            />
            <Text style={styles.navigateText}>Evacuate Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000050",
  },
  modalContent: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 16,
    backgroundColor: Colors.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.light,
    borderWidth: 2,
    borderColor: Colors.grey,
  },
  navigateButton: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    color: Colors.dark,
    fontWeight: "600",
  },
  navigateText: {
    color: Colors.light,
    fontWeight: "600",
  },
});

export default NavigationModal;
