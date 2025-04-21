import React, { forwardRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface SearchHeaderProps {
  onSearch: (text: string) => void;
}

const SearchHeader = forwardRef<View, SearchHeaderProps>(
  ({ onSearch }, ref) => {
    const { colors, isDarkMode } = useTheme();
    const styles = createStyles(colors, isDarkMode);

    return (
      <View style={styles.header} ref={ref}>
        <TextInput
          style={styles.search}
          placeholder="Search location"
          placeholderTextColor={
            isDarkMode ? colors.darkTextSecondary : colors.textSecondary
          }
          onChangeText={onSearch}
        />
      </View>
    );
  }
);

const createStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    header: {
      position: "absolute",
      top: 40,
      left: 16,
      right: 16,
      zIndex: 1,
    },
    search: {
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      padding: 16,
      borderRadius: 12,
      fontSize: 16,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
      color: isDarkMode ? colors.darkText : colors.text,
    },
  });

export default SearchHeader;
