import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Location } from "@/constants/models";

const SavedLocationItem = memo(
  ({ item, onPress }: { item: Location; onPress: () => void }) => {
    const { colors, isDarkMode } = useTheme();
    const styles = createStyles(colors, isDarkMode);

    return (
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: new Animated.Value(0) }],
            opacity: new Animated.Value(1),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="safety-divider"
              size={24}
              color={isDarkMode ? colors.darkAccentRed : colors.accentRed}
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.savedBadge}>
                <MaterialIcons
                  name="bookmark"
                  size={14}
                  color={isDarkMode ? colors.darkText : colors.text}
                />
              </View>
            </View>
            <View style={styles.addressContainer}>
              <MaterialIcons
                name="location-on"
                size={14}
                color={isDarkMode ? colors.darkTextSecondary : colors.textSecondary}
                style={styles.addressIcon}
              />
              <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
            </View>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={isDarkMode ? colors.darkTextSecondary : colors.textSecondary}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const createStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    card: {
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
    touchable: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDarkMode
        ? colors.darkAccentRed + "15"
        : colors.accentRed + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    name: {
      fontSize: 17,
      fontWeight: "600",
      color: isDarkMode ? colors.darkText : colors.text,
      flex: 1,
    },
    savedBadge: {
      backgroundColor: isDarkMode ? colors.darkAccentRed + "20" : colors.accentRed + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    addressIcon: {
      marginRight: 4,
    },
    address: {
      fontSize: 14,
      color: isDarkMode ? colors.darkTextSecondary : colors.textSecondary,
      flex: 1,
    },
  });

export default SavedLocationItem;
