import React, { memo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import type { Location } from "../constants/models";
import { useTheme } from "@/context/ThemeContext";

const LocationList = memo(
  ({
    locations,
    onSelectLocation,
  }: {
    locations: Location[];
    onSelectLocation: (location: Location) => void;
  }) => {
    const { colors } = useTheme();
    
    return (
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.background }]}
            onPress={() => onSelectLocation(item)}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="place" size={24} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.address, { color: colors.grey }]}>{item.address}</Text>
              <Text style={[styles.distance, { color: colors.grey }]}>{item.distance}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    );
  }
);

const styles = StyleSheet.create({
  list: { paddingBottom: 24, paddingHorizontal: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  address: { fontSize: 14, marginTop: 2 },
  distance: { fontSize: 14, marginTop: 2 },
});

export default LocationList;