import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Text,
  Alert,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import DashboardViewModel from "../../../hooks/dashboardModel";
import LocationList from "../../../components/LocationList";
import SearchHeader from "../../../components/SearchHeader";
import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  MarkerView,
  ShapeSource,
  LineLayer,
  UserLocation,
} from "@rnmapbox/maps";
import Colors from "@/constants/Colors";

const access_token =
  "REMOVED_MAPBOX_PUBLIC_TOKEN";
Mapbox.setAccessToken(access_token);

const DashboardScreen = () => {
  const viewModel = DashboardViewModel();
  const translateY = useSharedValue(0);
  const MAX_TRANSLATE_Y = -400;
  const CLOSED_TRANSLATE_Y = 0;
  const [darkMode, setDarkMode] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    32.859742, 39.933363,
  ]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(6);

  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 6,
        animationDuration: 1000,
      });
    }
  }, [userLocation, zoomLevel]);

  const fetchRoute = async (destination: {
    latitude: number;
    longitude: number;
  }) => {
    if (!userLocation) return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${access_token}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length) {
        setRoute({
          type: "Feature",
          geometry: data.routes[0].geometry,
          properties: {},
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setSelectedLocation(location);
    setShowPopup(true); // Show the popup
  };

  const handleNavigationConfirm = () => {
    if (selectedLocation) {
      fetchRoute(selectedLocation); // Draw the route
      setShowPopup(false); // Hide the popup
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.zoomControls}>
        <TouchableOpacity
          onPress={() => {
            const newZoom = Math.min(zoomLevel + 1, 20);
            setZoomLevel(newZoom);
            cameraRef.current?.setCamera({
              zoomLevel: newZoom,
              animationDuration: 500,
            });
          }}
          style={styles.zoomButton}
        >
          <MaterialIcons name="zoom-in" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const newZoom = Math.max(zoomLevel - 1, 3);
            setZoomLevel(newZoom);
            cameraRef.current?.setCamera({
              zoomLevel: newZoom,
              animationDuration: 500,
            });
          }}
          style={styles.zoomButton}
        >
          <MaterialIcons name="zoom-out" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        styleURL={
          darkMode
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/streets-v12"
        }
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={userLocation}
          zoomLevel={zoomLevel}
          animationDuration={1000}
        />
        <LocationPuck puckBearingEnabled puckBearing="heading" />
        <UserLocation
          onUpdate={(location) => {
            setUserLocation([
              location.coords.longitude,
              location.coords.latitude,
            ]);
          }}
        />

        {selectedLocation && (
          <MarkerView
            coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
          >
            <View style={styles.marker}>
              <MaterialIcons name="location-pin" size={32} color="red" />
            </View>
          </MarkerView>
        )}

        {route && (
          <ShapeSource id="routeSource" shape={route}>
            <LineLayer
              id="routeLayer"
              style={{ lineColor: "green", lineWidth: 3 }}
            />
          </ShapeSource>
        )}
      </MapView>

      <TouchableOpacity
        onPress={() => setDarkMode(!darkMode)}
        style={styles.themeToggle}
      >
        <MaterialIcons
          name={darkMode ? "light-mode" : "dark-mode"}
          size={24}
          color={darkMode ? "#FFD700" : "#000"}
        />
      </TouchableOpacity>

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
          <View style={styles.handle} />
          <LocationList
            locations={viewModel.locations}
            onSelectLocation={(location) => {
              handleLocationSelect({
                latitude: location.latitude,
                longitude: location.longitude,
              });
            }}
          />
        </Animated.View>
      </GestureDetector>

      <Modal
        visible={showPopup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>
              Do you want to navigate to this location?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={styles.popupButtonNo}
                onPress={() => setShowPopup(false)}
              >
                <FontAwesome6 name="xmark" size={30} color="red" />
                <Text style={styles.popupButtonTextNo}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={handleNavigationConfirm}
              >
                <FontAwesome6
                  name="diamond-turn-right"
                  size={30}
                  color="white"
                />
                <Text style={styles.popupButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  marker: {
    backgroundColor: "white",
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
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  zoomControls: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 8,
    elevation: 3,
    zIndex: 2,
  },
  zoomButton: {
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popupContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  popup: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 25,
    borderColor: Colors.green,
    borderWidth: 2,
    position: "absolute",
    bottom: 220,
    justifyContent: "center",
    left: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popupText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  popupButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  popupButton: {
    padding: 10,
    backgroundColor: Colors.green,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  popupButtonNo: {
    padding: 10,
    backgroundColor: Colors.light,
    borderRadius: 20,
    width: "40%",
    alignItems: "center",
    borderColor: Colors.red,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  popupButtonText: {
    color: "white",
    fontSize: 16,
  },
  popupButtonTextNo: {
    color: Colors.red,
    fontSize: 16,
  },
});

export default DashboardScreen;
