import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '@/context/ThemeContext';

const HelpScreen = () => {
  const { colors } = useTheme();

  const emergencyNumbers = [
    { name: "AFAD", number: "122", icon: "alert-octagon", color: "#FF5252" },
    {
      name: "Polis İmdat",
      number: "155",
      icon: "police-badge",
      color: "#2196F3",
    },
    {
      name: "Ambulans",
      number: "112",
      icon: "medical-bag",
      color: "#4CAF50",
    },
    {
      name: "İtfaiye",
      number: "110",
      icon: "fire",
      color: "#FF9800",
    },
    { name: "Jandarma", number: "156", icon: "shield-check", color: "#9C27B0" },
    { name: "Alo Deprem", number: "186", icon: "vibrate", color: "#795548" },
  ];

  const kitCategories = [
    {
      title: "Temel İhtiyaçlar",
      color: "#2196F3",
      items: [
        {
          icon: "cup-water",
          text: "Su (Her kişi için 4 litre)",
          detail: "En az 3 günlük su ihtiyacı",
        },
        {
          icon: "food",
          text: "Konserve Yiyecekler",
          detail: "Açılması kolay, uzun ömürlü gıdalar",
        },
        {
          icon: "food-variant",
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
          icon: "medical-bag",
          text: "İlk Yardım Çantası",
          detail: "Temel medikal malzemeler",
        },
        {
          icon: "pill",
          text: "İlaçlar",
          detail: "Düzenli kullanılan ilaçlar ve ağrı kesiciler",
        },
        {
          icon: "hand-wash",
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
          icon: "flashlight",
          text: "El Feneri",
          detail: "Ekstra piller ile birlikte",
        },
        {
          icon: "battery",
          text: "Yedek Piller",
          detail: "Farklı boyutlarda",
        },
        { icon: "whistle", text: "Düdük", detail: "Yardım çağırmak için" },
        { icon: "radio", text: "Radyo", detail: "Pilli veya kablosuz" },
      ],
    },
    {
      title: "Barınma ve Isınma",
      color: "#9C27B0",
      items: [
        {
          icon: "blanket",
          text: "Battaniye",
          detail: "Termal battaniye tercih edilir",
        },
        {
          icon: "tshirt-crew",
          text: "Yedek Kıyafetler",
          detail: "Hava koşullarına uygun",
        },
        {
          icon: "tent",
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
          icon: "card-account-details",
          text: "Kimlik Belgeleri",
          detail: "Kimlik, pasaport fotokopileri",
        },
        {
          icon: "file-document",
          text: "Tapu ve Sigorta",
          detail: "Önemli evrak fotokopileri",
        },
        {
          icon: "bank",
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
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="help-circle" size={32} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Yardım</Text>
              <Text style={[styles.subtitle, { color: colors.grey }]}>
                Acil durum bilgileri ve kaynaklar
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Numbers Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="phone" size={20} color={colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Acil Numaralar</Text>
          </View>
          <View style={styles.emergencyGrid}>
            {emergencyNumbers.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emergencyButton,
                  { 
                    borderColor: item.color + "30",
                    backgroundColor: colors.background,
                  },
                ]}
                onPress={() => Linking.openURL(`tel:${item.number}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.emergencyIconContainer, { backgroundColor: item.color + "20" }]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={28}
                    color={item.color}
                  />
                </View>
                <Text style={[styles.emergencyName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.emergencyNumber, { color: item.color }]}>
                  {item.number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Kit Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bag-personal" size={20} color={colors.primary} />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Deprem Çantası</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.grey }]}>
                Acil durumda ihtiyaç duyabileceğiniz temel malzemeler
              </Text>
            </View>
          </View>
          {kitCategories.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + "20" }]}>
                  <MaterialCommunityIcons name="folder" size={18} color={category.color} />
                </View>
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
                        borderLeftColor: category.color,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <View style={[styles.kitIconContainer, { backgroundColor: category.color + "20" }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={22}
                        color={category.color}
                      />
                    </View>
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

        {/* Links Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="link" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Faydalı Linkler</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.linkButton, 
              { 
                borderColor: colors.primary + "30",
                backgroundColor: colors.background,
              }
            ]}
            onPress={() => openURL("https://www.afad.gov.tr")}
            activeOpacity={0.7}
          >
            <View style={[styles.linkIconContainer, { backgroundColor: colors.primary + "20" }]}>
              <MaterialCommunityIcons name="web" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.linkText, { color: colors.text }]}>AFAD Web Sitesi</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.linkButton, 
              { 
                borderColor: colors.primary + "30",
                backgroundColor: colors.background,
              }
            ]}
            onPress={() => openURL("https://deprem.afad.gov.tr")}
            activeOpacity={0.7}
          >
            <View style={[styles.linkIconContainer, { backgroundColor: colors.primary + "20" }]}>
              <MaterialCommunityIcons name="map" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.linkText, { color: colors.text }]}>Deprem Haritaları</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  emergencyButton: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  emergencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemsContainer: {
    gap: 8,
  },
  kitItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    marginLeft: 4,
  },
  kitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    lineHeight: 16,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});

export default HelpScreen;
