import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const HelpScreen = () => {
  const emergencyNumbers = [
    { name: "AFAD", number: "122" },
    { name: "Polis İmdat", number: "155" },
    { name: "Ambulans", number: "112" },
    { name: "İtfaiye", number: "110" },
    { name: "Jandarma", number: "156" },
    { name: "Alo Deprem", number: "186" },
  ];

  const kitItems = [
    { icon: "local-drink", text: "Su, konserve yiyecekler, enerji barları" },
    { icon: "medical-services", text: "İlk yardım çantası, ilaçlar" },
    { icon: "flashlight-on", text: "El feneri, pil, düdük" },
    { icon: "hotel", text: "Battaniye, giysi, çadır" },
    { icon: "description", text: "Önemli belge fotokopileri (kimlik, tapu, sigorta)" },
  ];

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("URL açılamadı: ", err));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yardım Sayfası</Text>

      {/* Acil Durum Numaraları */}
      <Text style={styles.sectionTitle}>Acil Durum Numaraları</Text>
      {emergencyNumbers.map((item, index) => (
        <View key={index} style={styles.emergencyCard}>
          <MaterialIcons name="phone" size={24} color={Colors.red} />
          <Text style={styles.emergencyText}>
            {item.name}: {item.number}
          </Text>
        </View>
      ))}

      {/* Deprem Çantası İçeriği */}
      <Text style={styles.sectionTitle}>Deprem Çantası İçeriği</Text>
      <View style={styles.kitContainer}>
        {kitItems.map((item, index) => (
          <View key={index} style={styles.kitCard}>
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.kitText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Faydalı Bağlantılar */}
      <Text style={styles.sectionTitle}>Faydalı Bağlantılar</Text>
      <TouchableOpacity
        style={styles.linkCard}
        onPress={() => openURL("https://www.afad.gov.tr")}
      >
        <Text style={styles.linkText}>AFAD Web Sitesi</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.linkCard}
        onPress={() => openURL("https://deprem.afad.gov.tr")}
      >
        <Text style={styles.linkText}>Deprem Haritaları</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: Colors.light, // white yerine light kullanıldı
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 16,
  },
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light, // white yerine light kullanıldı
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyText: {
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 8,
  },
  kitContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kitCard: {
    width: "48%", // İki sütunlu grid
    backgroundColor: Colors.light, // white yerine light kullanıldı
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  kitText: {
    fontSize: 14,
    color: Colors.dark,
    marginTop: 8,
    textAlign: "center",
  },
  linkCard: {
    backgroundColor: Colors.light, // white yerine light kullanıldı
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});

export default HelpScreen;
