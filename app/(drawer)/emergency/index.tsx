import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const emergencyMessages = [
  {
    id: 1,
    title: 'Yardıma İhtiyacım Var',
    message: 'Deprem sonrası yardıma ihtiyacım var. Konumum: ',
    icon: 'help',
    color: '#FF5252',
    bgColor: '#FFEBEE',
  },
  {
    id: 2,
    title: 'Enkaz Altındayım',
    message: 'Enkaz altındayım. Acil yardım gerekiyor. Konumum: ',
    icon: 'warning',
    color: '#FF9800',
    bgColor: '#FFF3E0',
  },
  {
    id: 3,
    title: 'Güvenli Bölgedeyim',
    message: 'Güvenli bir bölgedeyim. Ailem ve arkadaşlarım beni arıyorsa bilgilendirilmelerini rica ederim.',
    icon: 'check-circle',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  {
    id: 4,
    title: 'Tıbbi Yardım Gerekiyor',
    message: 'Tıbbi yardıma ihtiyacım var. Konumum: ',
    icon: 'medical-services',
    color: '#2196F3',
    bgColor: '#E3F2FD',
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
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={[styles.headerIconContainer, { backgroundColor: colors.error + '20' }]}>
          <MaterialIcons name="emergency" size={32} color={colors.error} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Acil Durum Mesajları</Text>
          <Text style={[styles.subtitle, { color: colors.grey }]}>Hızlı ve güvenli iletişim</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.primary + '20' }]}>
        <MaterialIcons name="info" size={24} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          Aşağıdaki hazır mesajlardan birini seçerek acil durum bildirimi gönderebilirsiniz.
        </Text>
      </View>

      <View style={styles.messagesContainer}>
        {emergencyMessages.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.messageCard,
              { 
                backgroundColor: isDarkMode ? colors.card : item.bgColor,
                borderColor: item.color + '40',
                borderWidth: 1,
              },
              isLoading && styles.disabledCard
            ]}
            onPress={() => handleSendMessage(item.message)}
            disabled={isLoading}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <MaterialIcons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.messageContent}>
              <Text style={[styles.messageTitle, { color: item.color }]}>{item.title}</Text>
              <Text style={[styles.messageText, { color: colors.grey }]}>{item.message}</Text>
            </View>
            <View style={[styles.sendButton, { backgroundColor: item.color + '20' }]}>
              <MaterialIcons name="send" size={24} color={item.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  messagesContainer: {
    gap: 16,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledCard: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmergencyScreen; 