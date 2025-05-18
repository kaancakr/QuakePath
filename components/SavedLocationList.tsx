import React, { memo } from "react";
import { FlatList, StyleSheet } from "react-native";
import type { Location } from "../constants/models";
import SavedLocationItem from "./SavedLocationItem";

const SavedLocationList = memo(
  ({
    locations,
    onSelectLocation,
  }: {
    locations: Location[];
    onSelectLocation: (location: Location) => void;
  }) => (
    <FlatList
      data={locations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SavedLocationItem 
          name={item.name}
          address={item.address}
          onPress={() => onSelectLocation(item)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  )
);

const styles = StyleSheet.create({
  list: { paddingBottom: 24, paddingHorizontal: 8 },
});

export default SavedLocationList;
