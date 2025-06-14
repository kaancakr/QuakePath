import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get("window");

const HelpScreen = () => {
  const { colors } = useTheme();

  const emergencyNumbers = [
    { name: "AFAD", number: "122", icon: "warning", color: "#FF5252" },
    {
      name: "Polis İmdat",
      number: "155",
      icon: "local-police",
      color: "#2196F3",
    },
    {
      name: "Ambulans",
      number: "112",
      icon: "medical-services",
      color: "#4CAF50",
    },
    {
      name: "İtfaiye",
      number: "110",
      icon: "local-fire-department",
      color: "#FF9800",
    },
    { name: "Jandarma", number: "156", icon: "security", color: "#9C27B0" },
    { name: "Alo Deprem", number: "186", icon: "vibration", color: "#795548" },
  ];

  const kitCategories = [
    {
      title: "Temel İhtiyaçlar",
      color: "#2196F3",
      items: [
        {
          icon: "local-drink",
          text: "Su (Her kişi için 4 litre)",
          detail: "En az 3 günlük su ihtiyacı",
        },
        {
          icon: "restaurant",
          text: "Konserve Yiyecekler",
          detail: "Açılması kolay, uzun ömürlü gıdalar",
        },
        {
          icon: "energy-savings-leaf",
          text: "Enerji Barları",
          detail: "Yüksek kalorili, taşınabilir gıdalar",
        },
      ],
    },
    {
      title: "İlk Yardım",
      color: "#4CAF50",
      items: [
        {
          icon: "medical-services",
          text: "İlk Yardım Çantası",
          detail: "Temel medikal malzemeler",
        },
        {
          icon: "medication",
          text: "İlaçlar",
          detail: "Düzenli kullanılan ilaçlar ve ağrı kesiciler",
        },
        {
          icon: "sanitizer",
          text: "Dezenfektan",
          detail: "El ve yara temizliği için",
        },
      ],
    },
    {
      title: "Aydınlatma ve İletişim",
      color: "#FF9800",
      items: [
        {
          icon: "flashlight-on",
          text: "El Feneri",
          detail: "Ekstra piller ile birlikte",
        },
        {
          icon: "battery-charging-full",
          text: "Yedek Piller",
          detail: "Farklı boyutlarda",
        },
        { icon: "volume-up", text: "Düdük", detail: "Yardım çağırmak için" },
        { icon: "radio", text: "Radyo", detail: "Pilli veya kablosuz" },
      ],
    },
    {
      title: "Barınma ve Isınma",
      color: "#9C27B0",
      items: [
        {
          icon: "hotel",
          text: "Battaniye",
          detail: "Termal battaniye tercih edilir",
        },
        {
          icon: "checkroom",
          text: "Yedek Kıyafetler",
          detail: "Hava koşullarına uygun",
        },
        {
          icon: "home",
          text: "Çadır",
          detail: "Acil durum barınması için",
        },
      ],
    },
    {
      title: "Önemli Belgeler",
      color: "#795548",
      items: [
        {
          icon: "description",
          text: "Kimlik Belgeleri",
          detail: "Kimlik, pasaport fotokopileri",
        },
        {
          icon: "home",
          text: "Tapu ve Sigorta",
          detail: "Önemli evrak fotokopileri",
        },
        {
          icon: "account-balance",
          text: "Banka Bilgileri",
          detail: "Kart ve hesap bilgileri",
        },
      ],
    },
  ];

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("URL açılamadı: ", err));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="help" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Yardım</Text>
      </View>

      {/* Emergency Numbers */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acil Numaralar</Text>
        <View style={styles.emergencyGrid}>
          {emergencyNumbers.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emergencyButton,
                { 
                  borderColor: item.color + "40",
                  backgroundColor: colors.card,
                },
              ]}
              onPress={() => Linking.openURL(`tel:${item.number}`)}
            >
              <MaterialIcons
                name={item.icon as any}
                size={32}
                color={item.color}
              />
              <Text style={[styles.emergencyName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.emergencyNumber, { color: item.color }]}>
                {item.number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Emergency Kit */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Deprem Çantası</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.grey }]}>
          Acil durumda ihtiyaç duyabileceğiniz temel malzemeler
        </Text>
        {kitCategories.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <MaterialIcons name="category" size={24} color={category.color} />
              <Text style={[styles.categoryTitle, { color: category.color }]}>
                {category.title}
              </Text>
            </View>
            <View style={styles.itemsContainer}>
              {category.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.kitItem,
                    { 
                      borderColor: category.color + "40",
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={28}
                    color={category.color}
                  />
                  <View style={styles.itemTextContainer}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{item.text}</Text>
                    <Text style={[styles.itemDetail, { color: colors.grey }]}>{item.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Links */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Faydalı Linkler</Text>
        <TouchableOpacity
          style={[
            styles.linkButton, 
            { 
              borderColor: colors.primary + "40",
              backgroundColor: colors.card,
            }
          ]}
          onPress={() => openURL("https://www.afad.gov.tr")}
        >
          <MaterialIcons name="language" size={24} color={colors.primary} />
          <Text style={[styles.linkText, { color: colors.primary }]}>AFAD Web Sitesi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.linkButton, 
            { 
              borderColor: colors.primary + "40",
              backgroundColor: colors.card,
            }
          ]}
          onPress={() => openURL("https://deprem.afad.gov.tr")}
        >
          <MaterialIcons name="map" size={24} color={colors.primary} />
          <Text style={[styles.linkText, { color: colors.primary }]}>Deprem Haritaları</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  emergencyButton: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  emergencyNumber: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  itemsContainer: {
    gap: 8,
  },
  kitItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 13,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default HelpScreen;
