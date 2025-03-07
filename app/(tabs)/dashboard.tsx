import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const Dashboard = () => {
  return (
    <ScrollView style={styles.container}>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
});

export default Dashboard;