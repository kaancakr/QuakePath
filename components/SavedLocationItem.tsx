import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Location } from "@/constants/models";

const SavedLocationItem = memo(
  ({ item, onPress }: { item: Location; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <MaterialIcons name="safety-divider" size={24} color={Colors.primary} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  )
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.red,
  },
  textContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  address: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 4,
  },
});

export default SavedLocationItem;
