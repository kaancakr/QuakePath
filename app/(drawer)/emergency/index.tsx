import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import * as Location from 'expo-location';

const emergencyMessages = [
  {
    id: 1,
    title: 'Yardıma İhtiyacım Var',
    message: 'Deprem sonrası yardıma ihtiyacım var. Konumum: ',
    icon: 'help-circle',
    color: '#FF5252',
  },
  {
    id: 2,
    title: 'Enkaz Altındayım',
    message: 'Enkaz altındayım. Acil yardım gerekiyor. Konumum: ',
    icon: 'alert-octagon',
    color: '#FF9800',
  },
  {
    id: 3,
    title: 'Güvenli Bölgedeyim',
    message: 'Güvenli bir bölgedeyim. Ailem ve arkadaşlarım beni arıyorsa bilgilendirilmelerini rica ederim.',
    icon: 'check-circle',
    color: '#4CAF50',
  },
  {
    id: 4,
    title: 'Tıbbi Yardım Gerekiyor',
    message: 'Tıbbi yardıma ihtiyacım var. Konumum: ',
    icon: 'medical-bag',
    color: '#2196F3',
  },
];

const EmergencyScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { colors, isDarkMode } = useTheme();

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Konum izni gerekli');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return `${location.coords.latitude}, ${location.coords.longitude}`;
    } catch (error) {
      console.error('Konum alınamadı:', error);
      return null;
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      const fullMessage = location ? `${message}${location}` : message;
      
      // Burada mesh network entegrasyonu yapılacak
      Alert.alert(
        'Bilgi',
        'Mesajınız gönderildi. Mesh network sistemi hazır olduğunda mesajınız iletilecektir.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
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
            <View style={[styles.headerIcon, { backgroundColor: colors.error + '20' }]}>
              <MaterialCommunityIcons name="alert-octagon" size={32} color={colors.error} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Acil Durum</Text>
              <Text style={[styles.subtitle, { color: colors.grey }]}>Hızlı ve güvenli iletişim</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Aşağıdaki hazır mesajlardan birini seçerek acil durum bildirimi gönderebilirsiniz. Mesajınız otomatik olarak konum bilgisiyle birlikte gönderilecektir.
          </Text>
        </View>

        {/* Emergency Messages */}
        <View style={styles.messagesContainer}>
          {emergencyMessages.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.messageCard,
                { 
                  backgroundColor: colors.card,
                  borderLeftColor: item.color,
                  borderLeftWidth: 4,
                },
                isLoading && styles.disabledCard
              ]}
              onPress={() => handleSendMessage(item.message)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
              </View>
              <View style={styles.messageContent}>
                <Text style={[styles.messageTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.messageText, { color: colors.grey }]} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
              <View style={[styles.sendIconContainer, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name="send" size={20} color={item.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={24} color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.grey }]}>
              Mesaj gönderiliyor...
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  messagesContainer: {
    gap: 12,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  messageContent: {
    flex: 1,
    marginRight: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sendIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
});

export default EmergencyScreen; 