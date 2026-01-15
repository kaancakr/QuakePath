import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import SearchHeader from "../../../components/SearchHeader";
import { calculateDistance, calculateZoomLevel } from "@/utils/geoUtils";
import * as Location from "expo-location";
import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  MarkerView,
  PointAnnotation,
  ShapeSource,
  LineLayer,
  VectorSource,
  SymbolLayer,
  UserLocation,
} from "@rnmapbox/maps";
import { Feature, LineString } from "geojson";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import EmergencyActions from "@/components/EmergencyActions";
import SavedLocationList from "@/components/SavedLocationList";
import NavigationModal from "@/components/NavigationModal";
import useDashboardViewModel from "../../../hooks/useDashboardModel";
import {
  createEmergencyAlert,
  EmergencyMessage,
  EmergencyRecord,
  sendEmergencyMessage,
  subscribeEmergencies,
  subscribeEmergencyMessages,
} from "@/utils/firebaseEmergency";
import { getCivilianLocations, LocationResponse } from "@/api";

const access_token =
  "REMOVED_MAPBOX_PUBLIC_TOKEN";
Mapbox.setAccessToken(access_token);

const DashboardScreen = () => {
  const viewModel = useDashboardViewModel();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { isRescueTeam } = useAuth();
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
  const [hasCentered, setHasCentered] = useState(false);
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [selectedEmergency, setSelectedEmergency] =
    useState<EmergencyRecord | null>(null);
  const [emergencyMessages, setEmergencyMessages] = useState<
    EmergencyMessage[]
  >([]);
  const [emergencyMessageText, setEmergencyMessageText] = useState("");
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const [isSendingEmergencyMessage, setIsSendingEmergencyMessage] =
    useState(false);
  const [civilianLocations, setCivilianLocations] = useState<LocationResponse[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const deviceIdRef = useRef(
    `${Platform.OS}-${Math.random().toString(36).slice(2, 10)}`
  );

  const formatTime = (d: Date) => {
    const date = new Date(d);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const isDefaultLocation =
    userLocation[0] === 32.85411 && userLocation[1] === 39.92077;

  useEffect(() => {
    if (!hasCentered && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: zoomLevel,
        animationDuration: 1000,
      });
      setHasCentered(true);
    }
  }, [hasCentered, userLocation, zoomLevel]);

  useEffect(() => {
    const unsubscribe = subscribeEmergencies(setEmergencies);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedEmergency) {
      setEmergencyMessages([]);
      return;
    }
    const unsubscribe = subscribeEmergencyMessages(
      selectedEmergency.id,
      setEmergencyMessages
    );
    return unsubscribe;
  }, [selectedEmergency?.id]);

  // Fetch civilian locations for rescue teams
  useEffect(() => {
    if (!isRescueTeam) return;

    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const result = await getCivilianLocations(true, 1000); // Get latest location per user
        if (result.success && result.data) {
          setCivilianLocations(result.data);
          console.log('[Dashboard] Loaded civilian locations:', result.data.length);
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching civilian locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
    // Refresh every 5 minutes for rescue teams
    const interval = setInterval(fetchLocations, 300000);
    return () => clearInterval(interval);
  }, [isRescueTeam]);

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

  const handleRaiseEmergency = async () => {
    if (isSendingEmergency) return;
    setIsSendingEmergency(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location required",
          "Please allow location access to send an emergency."
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const record = await createEmergencyAlert({
        userId: deviceIdRef.current,
        lat: current.coords.latitude,
        lng: current.coords.longitude,
        message: "Emergency reported",
        initialMessageText: "Emergency reported",
      });

      setSelectedEmergency(record);
    } catch (error) {
      console.error("Error sending emergency:", error);
      Alert.alert("Error", "Could not send emergency. Please try again.");
    } finally {
      setIsSendingEmergency(false);
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

  const handleSelectEmergency = (emergency: EmergencyRecord) => {
    setSelectedEmergency(emergency);
    setRoute(null);

    const distance = calculateDistance(userLocation, [
      emergency.lng,
      emergency.lat,
    ]);

    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [emergency.lng, emergency.lat],
        zoomLevel: calculateZoomLevel(distance),
        animationDuration: 800,
        animationMode: "flyTo",
      });
    }
  };

  const handleCloseEmergency = () => {
    setSelectedEmergency(null);
    setEmergencyMessages([]);
    setEmergencyMessageText("");
    setRoute(null);
  };

  const handleSendEmergencyMessage = async () => {
    if (!selectedEmergency || !emergencyMessageText.trim()) return;
    setIsSendingEmergencyMessage(true);
    try {
      await sendEmergencyMessage({
        emergencyId: selectedEmergency.id,
        senderId: deviceIdRef.current,
        text: emergencyMessageText.trim(),
      });
      setEmergencyMessageText("");
    } catch (error) {
      console.error("Error sending emergency message:", error);
      Alert.alert("Error", "Message could not be sent. Please try again.");
    } finally {
      setIsSendingEmergencyMessage(false);
    }
  };

  const emergencyLine = useMemo<Feature<LineString> | null>(() => {
    if (!selectedEmergency) return null;
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          userLocation,
          [selectedEmergency.lng, selectedEmergency.lat],
        ],
      },
      properties: {},
    };
  }, [selectedEmergency, userLocation]);

  const handleNavigationConfirm = async () => {
    if (isDefaultLocation) {
      alert("Waiting for your current location...");
      return;
    }
    if (selectedLocation) {
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
          defaultSettings={{
            centerCoordinate: userLocation,
            zoomLevel: zoomLevel,
          }}
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
              <MaterialIcons
                name="location-pin"
                size={32}
                color={colors.primary}
              />
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

        {emergencyLine && (
          <ShapeSource id="emergencyLineSource" shape={emergencyLine}>
            <LineLayer
              id="emergencyLineLayer"
              style={{
                lineColor: colors.error,
                lineWidth: 3,
                lineOpacity: 0.9,
                lineDasharray: [1, 1.2],
              }}
            />
          </ShapeSource>
        )}

        {emergencies.map((emergency) => (
          <PointAnnotation
            key={emergency.id}
            id={emergency.id}
            coordinate={[emergency.lng, emergency.lat]}
            onSelected={() => handleSelectEmergency(emergency)}
          >
            <View
              style={[
                styles.emergencyMarker,
                { backgroundColor: colors.error },
              ]}
            >
              <MaterialIcons name="warning" size={20} color="white" />
            </View>
          </PointAnnotation>
        ))}

        {/* Show civilian locations for rescue teams */}
        {isRescueTeam && civilianLocations.map((location) => (
          <PointAnnotation
            key={`civilian-${location.id}`}
            id={`civilian-${location.id}`}
            coordinate={[parseFloat(location.longitude.toString()), parseFloat(location.latitude.toString())]}
            onSelected={() => {
              setSelectedLocation({
                latitude: parseFloat(location.latitude.toString()),
                longitude: parseFloat(location.longitude.toString()),
              });
              setShowPopup(true);
            }}
          >
            <View
              style={[
                styles.civilianMarker,
                { backgroundColor: colors.primary },
              ]}
            >
              <MaterialIcons name="person-pin" size={18} color="white" />
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      {/* Show civilian location count for rescue teams */}
      {isRescueTeam && (
        <View
          style={[
            styles.infoBadge,
            {
              backgroundColor: colors.primary,
              position: "absolute",
              top: 60,
              right: 16,
              zIndex: 2,
            },
          ]}
        >
          <MaterialIcons name="people" size={18} color="white" />
          <Text style={[styles.infoBadgeText, { color: "#fff" }]}>
            {isLoadingLocations ? "Loading..." : `${civilianLocations.length} Civilians`}
          </Text>
        </View>
      )}

      <View style={styles.emergencyFabContainer}>
        <TouchableOpacity
          onPress={handleRaiseEmergency}
          disabled={isSendingEmergency}
          style={[
            styles.emergencyFab,
            { opacity: isSendingEmergency ? 0.7 : 1, backgroundColor: colors.error },
          ]}
        >
          <MaterialIcons name="emergency" size={22} color="#fff" />
          <Text style={[styles.emergencyFabText, { color: "#fff" }]}>
            {isSendingEmergency ? "Sending..." : "Send SOS"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topControlsTheme}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.controlButton,
            {
              backgroundColor: colors.background,
              left: 2,
              width: 50,
              height: 50,
            },
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
            style={[
              styles.controlButton,
              styles.zoomButton,
              { backgroundColor: colors.background },
            ]}
          >
            <MaterialIcons name="zoom-in" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleZoomOut}
            style={[
              styles.controlButton,
              styles.zoomButton,
              { backgroundColor: colors.background },
            ]}
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
            const shouldClose =
              event.velocityY > 0 ||
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Emergency Quick Actions
            </Text>
            <EmergencyActions
              onEmergencyPress={handleRaiseEmergency}
              onShelterPress={() => {
                /* Handle shelters */
              }}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Saved Safe Locations
            </Text>
            <SavedLocationList
              locations={viewModel.locations}
              onSelectLocation={handleLocationSelect}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      {selectedEmergency && (
        <View
          style={[
            styles.emergencyPanel,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.emergencyPanelHeader}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.panelTitle, { color: colors.text }]}>
                Emergency Alert
              </Text>
              <Text style={[styles.panelSub, { color: colors.grey }]}>
                {selectedEmergency.message}
              </Text>
              <Text style={[styles.panelLocation, { color: colors.grey }]}>
                {selectedEmergency.lat.toFixed(3)}, {selectedEmergency.lng.toFixed(3)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCloseEmergency}
              style={styles.closeButton}
              accessibilityLabel="Close emergency panel"
            >
              <MaterialIcons name="close" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.emergencyMessages}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              Messages
            </Text>
            <ScrollView
              style={styles.messagesList}
              contentContainerStyle={styles.messagesListContent}
            >
              {emergencyMessages.length === 0 ? (
                <Text style={{ color: colors.grey }}>No messages yet.</Text>
              ) : (
                emergencyMessages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor:
                          msg.senderId === deviceIdRef.current
                            ? colors.primary + "15"
                            : colors.background,
                        borderColor:
                          msg.senderId === deviceIdRef.current
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.messageSender, { color: colors.text }]}
                    >
                      {msg.senderId === deviceIdRef.current ? "You" : msg.senderId}
                    </Text>
                    <Text style={[styles.messageText, { color: colors.text }]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.messageTime, { color: colors.grey }]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View
              style={[
                styles.messageInputRow,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <TextInput
                style={[styles.messageInputBox, { color: colors.text }]}
                placeholder="Send a message to this alert"
                placeholderTextColor={colors.grey}
                value={emergencyMessageText}
                onChangeText={setEmergencyMessageText}
                editable={!isSendingEmergencyMessage}
              />
              <TouchableOpacity
                onPress={handleSendEmergencyMessage}
                disabled={
                  isSendingEmergencyMessage ||
                  !emergencyMessageText.trim() ||
                  !selectedEmergency
                }
                style={[
                  styles.sendMessageButton,
                  {
                    backgroundColor:
                      emergencyMessageText.trim() && !isSendingEmergencyMessage
                        ? colors.primary
                        : colors.grey,
                  },
                ]}
              >
                <MaterialIcons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, top: 0 }}
      >
        <NavigationModal
          visible={showPopup}
          onClose={() => setShowPopup(false)}
          onConfirm={handleNavigationConfirm}
          title="Initiate Emergency Navigation?"
          message="This route may pass through affected areas. Proceed with caution!"
        />
      </View>
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
  emergencyMarker: {
    padding: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  civilianMarker: {
    padding: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: "600",
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
  emergencyFabContainer: {
    position: "absolute",
    right: 16,
    bottom: 140,
    zIndex: 3,
  },
  emergencyFab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyFabText: {
    fontWeight: "700",
    fontSize: 14,
  },
  emergencyPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 4,
    gap: 8,
  },
  emergencyPanelHeader: {
    gap: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  panelSub: {
    fontSize: 14,
  },
  panelLocation: {
    fontSize: 12,
  },
  emergencyMessages: {
    gap: 8,
  },
  messagesList: {
    maxHeight: 180,
    marginVertical: 8,
  },
  messagesListContent: {
    gap: 8,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 2,
  },
  messageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  messageInputBox: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 14,
  },
  sendMessageButton: {
    padding: 10,
    borderRadius: 12,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#FF0000",
    borderRadius: 10
  },
});

export default DashboardScreen;
