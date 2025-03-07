import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/Colors";

type Slide = {
  key: string;
  title: string;
  text: string;
  image: any;
  backgroundColor: string;
};

const slides: Slide[] = [
  {
    key: "1",
    title: "Welcome to Onyx Code",
    text: "Learn coding efficiently with quizzes and roadmaps!",
    image: require("@/assets/images/onboarding1.png"),
    backgroundColor: Colors.teal,
  },
  {
    key: "2",
    title: "Track your Progress",
    text: "Get detailed progress statistics to improve your skills!",
    image: require("@/assets/images/onboarding1.png"),
    backgroundColor: Colors.orange,
  },
  {
    key: "3",
    title: "Let’s Get Started!",
    text: "Start your journey now!",
    image: require("@/assets/images/onboarding1.png"),
    backgroundColor: Colors.darkGreen,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const _renderItem = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <StatusBar barStyle={"light-content"} />
        <Text style={styles.title}>{item.title}</Text>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const _onDone = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/");
  };

  const _renderNextButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Next</Text>
      </View>
    );
  };

  const _renderDoneButton = () => {
    return (
      <TouchableOpacity onPress={_onDone} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    );
  };

  const _renderSkipButton = () => {
    return (
      <TouchableOpacity onPress={_onDone} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Skip</Text>
      </TouchableOpacity>
    );
  };

  return (
    <AppIntroSlider
      renderItem={_renderItem}
      data={slides}
      showSkipButton={true}
      renderNextButton={_renderNextButton}
      renderDoneButton={_renderDoneButton}
      renderSkipButton={_renderSkipButton}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    color: Colors.light,
    textAlign: "center",
    fontFamily: "AvenirNext-Bold",
    padding: 20,
  },
  text: {
    color: Colors.light,
    textAlign: "center",
    paddingHorizontal: 16,
    fontSize: 20,
    fontFamily: "AvenirNext",
    paddingBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 32,
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: Colors.dark,
    borderRadius: 25,
    borderColor: Colors.green,
    borderWidth: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "Avenir Next",
  },
});
