import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface SavedLocationItemProps {
  name: string;
  address: string;
  onPress: () => void;
  isEmergency?: boolean;
}

const SavedLocationItem = ({ name, address, onPress, isEmergency }: SavedLocationItemProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.background },
        isEmergency && { borderColor: colors.error }
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="safety-divider" size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.address, { color: colors.grey }]}>{address}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
  },
});

export default SavedLocationItem;
