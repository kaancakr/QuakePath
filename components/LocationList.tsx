import React, { memo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";
import type { Location } from "../constants/models";

const LocationList = memo(
  ({
    locations,
    onSelectLocation,
  }: {
    locations: Location[];
    onSelectLocation: (location: Location) => void;
  }) => {
    const { colors, isDarkMode } = useTheme();
    const styles = createStyles(colors, isDarkMode);

    return (
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            style={[
              styles.item,
              {
                transform: [{ translateY: new Animated.Value(0) }],
                opacity: new Animated.Value(1),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.touchable}
              onPress={() => onSelectLocation(item)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name="place"
                  size={24}
                  color={isDarkMode ? colors.darkAccentRed : colors.accentRed}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.addressContainer}>
                    <Icon
                      name="location-on"
                      size={14}
                      color={isDarkMode ? colors.darkTextSecondary : colors.textSecondary}
                      style={styles.addressIcon}
                    />
                    <Text style={styles.address} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                  <View style={styles.distanceContainer}>
                    <Icon
                      name="directions-walk"
                      size={14}
                      color={isDarkMode ? colors.darkTextSecondary : colors.textSecondary}
                      style={styles.distanceIcon}
                    />
                    <Text style={styles.distance}>{item.distance}</Text>
                  </View>
                </View>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={isDarkMode ? colors.darkTextSecondary : colors.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);

const createStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    list: {
      paddingBottom: 24,
      paddingHorizontal: 16,
    },
    item: {
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
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: isDarkMode ? colors.darkText : colors.text,
      marginBottom: 4,
    },
    detailsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    distanceContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    addressIcon: {
      marginRight: 4,
    },
    distanceIcon: {
      marginRight: 4,
    },
    address: {
      fontSize: 14,
      color: isDarkMode ? colors.darkTextSecondary : colors.textSecondary,
      flex: 1,
    },
    distance: {
      fontSize: 14,
      color: isDarkMode ? colors.darkTextSecondary : colors.textSecondary,
    },
  });

export default LocationList;
