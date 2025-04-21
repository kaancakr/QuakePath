import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const NavigationModal = ({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  return (
    <Modal transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Initiate Emergency Navigation?</Text>
          <MaterialIcons name="warning" size={40} color={colors.error} />
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
                color={isDarkMode ? colors.darkCard : colors.card}
              />
              <Text style={styles.navigateText}>Evacuate Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: isDarkMode ? colors.darkOverlay : colors.overlay,
    },
    modalContent: {
      margin: 20,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      gap: 16,
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: isDarkMode ? colors.darkText : colors.text,
      textAlign: "center",
    },
    modalText: {
      fontSize: 16,
      color: isDarkMode ? colors.darkTextSecondary : colors.textSecondary,
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
      borderWidth: 1,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cancelButton: {
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
    navigateButton: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    cancelText: {
      color: isDarkMode ? colors.darkText : colors.text,
      fontWeight: "600",
    },
    navigateText: {
      color: isDarkMode ? colors.darkCard : colors.card,
      fontWeight: "600",
    },
  });

export default NavigationModal;
