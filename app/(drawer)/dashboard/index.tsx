import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import SearchHeader from "../../../components/SearchHeader";
import { calculateDistance, calculateZoomLevel } from "@/utils/geoUtils";
import MapboxGL from "@rnmapbox/maps";
import { Camera } from "@rnmapbox/maps";
import {
  LocationPuck,
  MapView,
  MarkerView,
  ShapeSource,
  LineLayer,
  VectorSource,
  SymbolLayer,
} from "@rnmapbox/maps";
import EmergencyActions from "@/components/EmergencyActions";
import SavedLocationList from "@/components/SavedLocationList";
import NavigationModal from "@/components/NavigationModal";
import useDashboardViewModel from "../../../hooks/useDashboardModel";
import { useTheme } from "@/context/ThemeContext";

const access_token =
  "pk.eyJ1IjoiZWthYW5ja3IiLCJhIjoiY204M2Q0dXJxMGpmbzJpcXZlNDU0bXlhcyJ9.48mRreLT891aSutalkRclg";
MapboxGL.setAccessToken(access_token);

const DashboardScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const viewModel = useDashboardViewModel();
  const translateY = useSharedValue(0);
  const MAX_TRANSLATE_Y = -400;
  const CLOSED_TRANSLATE_Y = 0;
  const [userLocation, setUserLocation] = useState<[number, number]>([
    32.85411, 39.92077,
  ]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(12);

  const styles = createStyles(colors, isDarkMode);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: zoomLevel,
        animationDuration: 1000,
      });
    }
  }, [userLocation, zoomLevel]);

  const fetchRoute = async (destination: {
    latitude: number;
    longitude: number;
  }) => {
    if (!userLocation) return;

    try {
      const distance = calculateDistance(userLocation, [
        destination.longitude,
        destination.latitude,
      ]);

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full&steps=true&access_token=${access_token}`
      );

      const data = await response.json();

      if (data.routes?.[0]) {
        setRoute({
          type: "Feature",
          geometry: data.routes[0].geometry,
          properties: {},
        });

        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [destination.longitude, destination.latitude],
            zoomLevel: calculateZoomLevel(distance),
            animationDuration: 2000,
            animationMode: "flyTo",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    name: string;
  }) => {
    if (userLocation && cameraRef.current) {
      const distance = calculateDistance(userLocation, [
        location.longitude,
        location.latitude,
      ]);

      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: calculateZoomLevel(distance),
        animationDuration: 1000,
      });
    }

    setSelectedLocation(location);
    setShowPopup(true);
  };

  const handleNavigationConfirm = async () => {
    console.log("Navigation confirmed");
    if (selectedLocation) {
      console.log("Starting route to:", selectedLocation);
      await fetchRoute(selectedLocation);
      setShowPopup(false);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 1, 20);
    setZoomLevel(newZoom);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 500,
      });
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 1, 3);
    setZoomLevel(newZoom);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 500,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={
          isDarkMode
            ? "mapbox://styles/mapbox/navigation-night-v1"
            : "mapbox://styles/mapbox/navigation-day-v1"
        }
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={userLocation}
          zoomLevel={zoomLevel}
          animationDuration={1000}
        />
        <LocationPuck puckBearingEnabled puckBearing="heading" />
        {/* <UserLocation
          onUpdate={(location) => {
            setUserLocation([
              location.coords.longitude,
              location.coords.latitude,
            ]);
          }}
        /> */}

        <VectorSource
          id="mapbox-streets"
          url="mapbox://mapbox.mapbox-streets-v8"
        >
          <LineLayer
            id="road-label"
            sourceLayerID="road_label"
            style={{
              lineColor: isDarkMode ? "#ffffff" : "#000000",
              lineWidth: 1.5,
            }}
          />
          <SymbolLayer
            id="street-label"
            sourceLayerID="road_label"
            style={{
              textField: ["get", "name_en"],
              textSize: 14,
              textColor: isDarkMode ? "#ffffff" : "#000000",
              textHaloColor: isDarkMode ? "#000000" : "#ffffff",
              textHaloWidth: 1,
            }}
          />
        </VectorSource>

        {selectedLocation && (
          <MarkerView
            coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
          >
            <View style={styles.marker}>
              <MaterialIcons name="location-pin" size={32} color="green" />
            </View>
          </MarkerView>
        )}

        {route && (
          <ShapeSource id="routeSource" shape={route}>
            <LineLayer
              id="routeLayer"
              style={{
                lineColor: "#FF0000",
                lineWidth: 4,
                lineOpacity: 0.8,
                lineCap: "round",
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      <View style={styles.topControls}>
        <View style={styles.zoomContainer}>
          <TouchableOpacity
            onPress={handleZoomIn}
            style={[styles.controlButton, styles.zoomButton]}
          >
            <MaterialIcons
              name="zoom-in"
              size={20}
              color={isDarkMode ? colors.darkText : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleZoomOut}
            style={[styles.controlButton, styles.zoomButton]}
          >
            <MaterialIcons
              name="zoom-out"
              size={20}
              color={isDarkMode ? colors.darkText : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <SearchHeader onSearch={viewModel.handleSearch} />

      <GestureDetector
        gesture={Gesture.Pan()
          .onUpdate((event) => {
            translateY.value = Math.max(
              MAX_TRANSLATE_Y,
              Math.min(
                translateY.value + event.translationY,
                CLOSED_TRANSLATE_Y
              )
            );
          })
          .onEnd((event) => {
            translateY.value = withSpring(
              event.velocityY > 0 ||
                translateY.value > (MAX_TRANSLATE_Y + CLOSED_TRANSLATE_Y) / 2
                ? CLOSED_TRANSLATE_Y
                : MAX_TRANSLATE_Y
            );
          })}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            useAnimatedStyle(() => ({
              transform: [
                { translateY: withSpring(translateY.value, { damping: 20 }) },
              ],
            })),
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.sheetContent}>
            <Text style={styles.sectionTitle}>Emergency Quick Actions</Text>
            <EmergencyActions
              onEmergencyPress={() => {
                /* Handle emergency */
              }}
              onShelterPress={() => {
                /* Handle shelters */
              }}
            />

            <Text style={styles.sectionTitle}>Saved Safe Locations</Text>
            <SavedLocationList
              locations={viewModel.locations}
              onSelectLocation={handleLocationSelect}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <NavigationModal
        visible={showPopup}
        onCancel={() => setShowPopup(false)}
        onConfirm={handleNavigationConfirm}
      />
    </View>
  );
};

const createStyles = (colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    // Layout styles
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      position: "relative",
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },

    // Control styles
    topControls: {
      position: "absolute",
      top: 100,
      right: 16,
      gap: 12,
      zIndex: 2,
    },
    topControlsTheme: {
      position: "absolute",
      top: 100,
      left: 16,
      gap: 12,
      zIndex: 2,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
    zoomContainer: {
      gap: 8,
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      borderRadius: 15,
      padding: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
    zoomButton: {
      padding: 6,
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      borderRadius: 15,
      marginVertical: 5,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    // Map marker styles
    marker: {
      backgroundColor: isDarkMode ? colors.darkCard : colors.card,
      padding: 6,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Bottom sheet styles
    bottomSheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: -400,
      height: 600,
      backgroundColor: isDarkMode ? colors.darkHeaderBackground : colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      padding: 16,
      zIndex: 3,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
    handleContainer: {
      alignItems: "center",
      paddingVertical: 8,
    },
    handle: {
      width: 48,
      height: 4,
      backgroundColor: isDarkMode
        ? colors.darkTextSecondary
        : colors.textSecondary,
      borderRadius: 2,
    },
    sheetContent: {
      flex: 1,
      paddingHorizontal: 8,
    },

    // Text styles
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDarkMode ? colors.darkText : colors.text,
      marginBottom: 16,
      marginTop: 6,
    },
    buttonText: {
      color: isDarkMode ? colors.darkText : colors.text,
      fontSize: 16,
      fontWeight: "600",
    },

    // Location styles
    locationName: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? colors.darkText : colors.text,
      marginTop: 8,
    },
    locationDistance: {
      fontSize: 14,
      color: isDarkMode ? colors.darkTextSecondary : colors.textSecondary,
      marginTop: 4,
    },

    // Modal styles
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: isDarkMode ? colors.darkOverlay : colors.overlay,
    },
    navigateButton: {
      backgroundColor: isDarkMode ? colors.darkAccent : colors.accent,
    },
    cancelText: {
      color: isDarkMode ? colors.darkText : colors.text,
      fontWeight: "600",
    },
    navigateText: {
      color: isDarkMode ? colors.darkText : colors.text,
      fontWeight: "600",
    },

    // Action button styles
    button: {
      position: "absolute",
      bottom: 20,
      alignSelf: "center",
      backgroundColor: isDarkMode ? colors.darkAccent : colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      elevation: 3,
      shadowColor: isDarkMode ? colors.darkText : colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.darkBorder : colors.border,
    },
  });

export default DashboardScreen;
