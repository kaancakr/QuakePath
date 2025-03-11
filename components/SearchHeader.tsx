import React, { forwardRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface SearchHeaderProps {
  onSearch: (text: string) => void;
}

const SearchHeader = forwardRef<View, SearchHeaderProps>(
  ({ onSearch }, ref) => (
    <View style={styles.header} ref={ref}>
      <TextInput
        style={styles.search}
        placeholder="Search location"
        placeholderTextColor="#999"
        onChangeText={onSearch}
      />
    </View>
  )
);

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  search: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default SearchHeader;
