import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const OpeningScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const shakeAnimation = new Animated.Value(0);
  const scaleAnimation = new Animated.Value(1);
  const fadeAnimation = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -8,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 6,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 20,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/(drawer)/dashboard");
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnimation, backgroundColor: colors.background }]}>
      <StatusBar
        animated
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <View style={styles.content}>
        <Animated.Image
          source={require("../assets/images/QuakePath1.png")}
          style={[
            styles.logo,
            {
              transform: [
                { translateX: shakeAnimation },
                { scale: scaleAnimation },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
});

export default OpeningScreen;
