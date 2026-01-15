import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import OpeningScreen from "@/components/OpeningScreen";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated
    if (!user) {
      // Redirect to login if not authenticated
      const currentSegment = segments[0];
      if (currentSegment !== 'login') {
        router.replace('/login');
      }
    } else {
      // Redirect to dashboard if authenticated
      const currentSegment = segments[0];
      if (currentSegment === 'login' || (segments as string[]).length === 0) {
        router.replace('/(drawer)/dashboard');
      }
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <OpeningScreen />
    </View>
  );
}
