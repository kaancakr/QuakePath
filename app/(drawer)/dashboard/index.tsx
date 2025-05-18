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
import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  MarkerView,
  ShapeSource,
  LineLayer,
  VectorSource,
  SymbolLayer,
} from "@rnmapbox/maps";
import { useTheme } from "@/context/ThemeContext";
import EmergencyActions from "@/components/EmergencyActions";
import SavedLocationList from "@/components/SavedLocationList";
import NavigationModal from "@/components/NavigationModal";
import useDashboardViewModel from "../../../hooks/useDashboardModel";

const access_token =
  "REMOVED_MAPBOX_PUBLIC_TOKEN";
Mapbox.setAccessToken(access_token);

const DashboardScreen = () => {
  const viewModel = useDashboardViewModel();
  const { colors, isDarkMode, toggleTheme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              lineColor: isDarkMode ? colors.text : colors.dark,
              lineWidth: 1.5,
            }}
          />
          <SymbolLayer
            id="street-label"
            sourceLayerID="road_label"
            style={{
              textField: ["get", "name_en"],
              textSize: 14,
              textColor: isDarkMode ? colors.text : colors.dark,
              textHaloColor: isDarkMode ? colors.dark : colors.text,
              textHaloWidth: 1,
            }}
          />
        </VectorSource>

        {selectedLocation && (
          <MarkerView
            coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
          >
            <View style={styles.marker}>
              <MaterialIcons name="location-pin" size={32} color={colors.primary} />
            </View>
          </MarkerView>
        )}

        {route && (
          <ShapeSource id="routeSource" shape={route}>
            <LineLayer
              id="routeLayer"
              style={{
                lineColor: colors.error,
                lineWidth: 4,
                lineOpacity: 0.8,
                lineCap: "round",
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      <View style={styles.topControlsTheme}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.controlButton,
            { backgroundColor: colors.background, left: 2, width: 50, height: 50 },
          ]}
        >
          <MaterialIcons
            name={isDarkMode ? "light-mode" : "dark-mode"}
            size={24}
            color={isDarkMode ? colors.primary : colors.dark}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.topControls}>
        <View style={styles.zoomContainer}>
          <TouchableOpacity
            onPress={handleZoomIn}
            style={[styles.controlButton, styles.zoomButton, { backgroundColor: colors.background }]}
          >
            <MaterialIcons name="zoom-in" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleZoomOut}
            style={[styles.controlButton, styles.zoomButton, { backgroundColor: colors.background }]}
          >
            <MaterialIcons name="zoom-out" size={20} color={colors.text} />
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
            const shouldClose = event.velocityY > 0 ||
              translateY.value > (MAX_TRANSLATE_Y + CLOSED_TRANSLATE_Y) / 2;
            
            translateY.value = withSpring(
              shouldClose ? CLOSED_TRANSLATE_Y : MAX_TRANSLATE_Y,
              {
                damping: 25,
                stiffness: 80,
                mass: 1.2,
                velocity: event.velocityY * 0.5,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
              }
            );
          })}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            { backgroundColor: colors.background },
            useAnimatedStyle(() => ({
              transform: [{ translateY: translateY.value }],
            })),
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.grey }]} />
          </View>

          <View style={styles.sheetContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Quick Actions</Text>
            <EmergencyActions
              onEmergencyPress={() => {
                /* Handle emergency */
              }}
              onShelterPress={() => {
                /* Handle shelters */
              }}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Safe Locations</Text>
            <SavedLocationList
              locations={viewModel.locations}
              onSelectLocation={handleLocationSelect}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <NavigationModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onConfirm={handleNavigationConfirm}
        title="Initiate Emergency Navigation?"
        message="This route may pass through affected areas. Proceed with caution!"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, position: "relative" },
  map: { ...StyleSheet.absoluteFillObject },
  themeToggle: {
    position: "absolute",
    top: 100,
    right: 20,
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  marker: {
    padding: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -400,
    height: 600,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 16,
    zIndex: 3,
  },
  topControlsTheme: {
    position: "absolute",
    top: 100,
    left: 16,
    gap: 12,
    zIndex: 2,
  },
  topControls: {
    position: "absolute",
    top: 100,
    right: 16,
    gap: 12,
    zIndex: 2,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  zoomContainer: {
    gap: 8,
    borderRadius: 15,
    padding: 8,
  },
  searchContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 2,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 6,
  },
  emergencyButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  emergencyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shelterButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emergencyButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  safeLocationCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 8,
    borderWidth: 2,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  locationDistance: {
    fontSize: 14,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
  },
  navigateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  zoomButton: {
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#0000FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelText: {
    color: "#000",
    fontWeight: "600",
  },
  navigateText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default DashboardScreen;